"""
title: Freya Home Assistant Control
author: Freya Project
version: 0.1.0
license: MIT
requirements:

Open WebUI pipe wrapper for direct Home Assistant state lookups and smart-home
commands. Uses the shared implementation in home_assistant_pipeline.py.
"""

import importlib.util
from pathlib import Path


def _load_shared_pipeline_class():
    shared_path = Path(__file__).with_name("home_assistant_pipeline.py")
    spec = importlib.util.spec_from_file_location("freya_home_assistant_pipeline_shared", shared_path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module.Pipeline


SharedPipeline = _load_shared_pipeline_class()


class Pipeline(SharedPipeline):
    def __init__(self) -> None:
        super().__init__()
        self.id = "home_assistant_control"
        self.name = "Freya Home Assistant Control"
        if hasattr(self, "type"):
            delattr(self, "type")
