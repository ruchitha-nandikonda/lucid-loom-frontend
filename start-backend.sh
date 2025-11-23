#!/bin/bash
cd dream-backend
source venv/bin/activate
uvicorn main:app --reload

