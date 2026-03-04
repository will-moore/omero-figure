
from typing import Annotated

import json
import os
from fastapi import APIRouter, Request, Form, BackgroundTasks, HTTPException, Depends
from fastapi.responses import PlainTextResponse

from fastapi.staticfiles import StaticFiles

from pydantic import BaseModel

from fileglancer import database as db
# from fileglancer.fileglancer.user_context import CurrentUserContext
from fileglancer.user_context import UserContext, EffectiveUserContext, CurrentUserContext
from fileglancer.settings import get_settings
from fileglancer.filestore import Filestore
from fileglancer.model import FileSharePath
from fileglancer import auth

from omero_figure.scripts.omero.figure_scripts.Figure_To_Pdf import export_figure

# $ eval "$(pixi shell-hook)"
# pip install omero_figure


class Panel(BaseModel):
    name: str
    x: int
    y: int
    width: int
    height: int

class Figure(BaseModel):
    name: str
    # description: str | None = None
    # panels: list[Panel] = []


router = APIRouter()

settings = get_settings()

def get_static_dir():
    """
    Return the path to the static directory for the figure app.
    
    This is used to serve the static files for the figure app, which are built using Vite
    NB: this uses "npm run build" (same as for OMERO.figure) BUT we need to use `omero-figure` as
    the config base path, since fileglancer serves the static files from '/omero-figure/' URL.
    """
    current_file_path = os.path.abspath(__file__)
    static_dir = os.path.join(os.path.dirname(current_file_path), "..", "..", "omero_figure/static/omero_figure")
    static_dir = os.path.normpath(static_dir)
    return static_dir

def _get_mounted_filestore(fsp: FileSharePath):
    """Constructs a filestore for the given file share path, checking to make sure it is mounted."""
    filestore = Filestore(fsp)
    try:
        filestore.get_file_info(None)
    except FileNotFoundError:
        return None
    return filestore

# copied from fileglancer/filestore/app.py - should be refactored to a common utility module
def _get_filestore(path_name: str):
    """Get a filestore for the given path name."""
    # Get file share path using centralized function and filter for the requested path
    with db.get_db_session(settings.db_url) as session:
        fsp = db.get_file_share_path(session, path_name)
        if fsp is None:
            return None, f"File share path '{path_name}' not found"

    # Create a filestore for the file share path
    filestore = _get_mounted_filestore(fsp)
    if filestore is None:
        return None, f"File share path '{path_name}' is not mounted"

    return filestore, None

def _get_user_context(username: str) -> UserContext:
    if settings.use_access_flags:
        return EffectiveUserContext(username)
    else:
        return CurrentUserContext()
    
def get_current_user(request: Request):
    """
    FastAPI dependency to get the current authenticated user

    If OKTA auth is enabled, validates session from cookie
    If OKTA auth is disabled, falls back to $USER environment variable
    """
    return auth.get_current_user(request, get_settings())


# router.mount("/static", StaticFiles(packages=[("omero_figure", "statics")]), name="static")

# fetch("http://localhost:7878/omero-figure/save", {"method": "POST", body: JSON.stringify({ name: "example" })}).then(rsp => rsp.json()).then(j => console.log(j))
@router.post("/save", tags=["figure"])
async def save(request: Request):
    print("Figure save called", request)
    model = await request.json()
    print("Figure model:", model)

    return {"message": "Figure saved", "figure": "OK"}


def run_export_script(figureJSON: str, exportOption: str):
    print("Exporting figure with options:", exportOption)
    print("Figure JSON:", json.loads(figureJSON))
    # Simulate export processing
    # import time
    # time.sleep(5)  # Simulate time-consuming export task
    # run_export(json.loads(figureJSON), exportOption)

    script_args = {
                    "Figure_JSON": figureJSON,
                    "Export_Option": exportOption,
                    # TODO: Fix URL
                    "Webclient_URI": "http://Fileglancer/"
                }

    export_figure(None, script_args)

    print("Figure export completed.")


# This handles OMERO.figure form submission to Export a figure. The export is done in the background to avoid blocking the server.
@router.post("/export")
async def export(
    figureJSON: Annotated[str, Form()],
    exportOption: Annotated[str, Form()],
    filepath: Annotated[str, Form()],
    background_tasks: BackgroundTasks,
    # username: str = Depends(get_current_user)
    ):

    print("export", exportOption, filepath)

    # with _get_user_context(username):

    filestore, error = _get_filestore("Desktop")
    print("filestore, error:", filestore, error)
    # if filestore is None:
    #     raise HTTPException(status_code=404 if "not found" in error else 500, detail=error)

    background_tasks.add_task(run_export_script, figureJSON, exportOption)

    return {"message": "Figure Exported", "figure": "OK"}


# http://127.0.0.1:7878/figure/app
@router.get("/app", tags=["figure"])
async def app():
    return [{"username": "Will Moore 2"}, {"username": "will"}]

# get the path to this script, then go up two levels and into the dist directory to find the static files


# static_dir = os.path.join(os.path.dirname(__file__), "..", "..", "dist")
# print("Figure Static dir:", static_dir)
# app.mount("/static", StaticFiles(directory=static_dir), name="static")


@router.get('/figure.txt', response_class=PlainTextResponse, include_in_schema=False)
def figuretest():
    return """Figure Test In module"""
