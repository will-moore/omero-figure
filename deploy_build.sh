#!/bin/bash

#copy over html,css,js and templates
echo "Deploying built resources to omero_figure directory..."
mkdir -p omero_figure/static/omero_figure/
cp -r dist/*.js* omero_figure/static/omero_figure/
