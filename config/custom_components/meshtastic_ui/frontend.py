"""Frontend panel registration for Meshtastic UI."""

from __future__ import annotations

from homeassistant.components.frontend import async_remove_panel
from homeassistant.components.panel_custom import async_register_panel as async_register_custom_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.core import HomeAssistant

from .const import DOMAIN, FRONTEND_PATH, PANEL_ICON, PANEL_TITLE, PANEL_URL
from .ha_frontend import locate_dir


async def async_register_panel(hass: HomeAssistant) -> None:
    """Register the Meshtastic UI panel."""
    frontend_dir = locate_dir()

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                f"/{PANEL_URL}/{FRONTEND_PATH}",
                str(frontend_dir),
                cache_headers=False,
            )
        ]
    )

    # Remove stale panel from a previous (possibly failed) setup.
    async_remove_panel(hass, PANEL_URL, warn_if_unknown=False)

    await async_register_custom_panel(
        hass,
        frontend_url_path=PANEL_URL,
        webcomponent_name="meshtastic-ui-panel",
        sidebar_title=PANEL_TITLE,
        sidebar_icon=PANEL_ICON,
        module_url=f"/{PANEL_URL}/{FRONTEND_PATH}/panel.js",
        require_admin=False,
    )


def async_unregister_panel(hass: HomeAssistant) -> None:
    """Remove the panel."""
    async_remove_panel(hass, PANEL_URL)
