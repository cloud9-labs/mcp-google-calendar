# @cloud9-labs/mcp-google-calendar

MCP server for Google Calendar API - 10 event and calendar management tools.

## Installation

```json
{
  "mcpServers": {
    "google-calendar": {
      "command": "npx",
      "args": ["-y", "@cloud9-labs/mcp-google-calendar"],
      "env": {
        "GOOGLE_ACCESS_TOKEN": "your-access-token"
      }
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| gcal_list_calendars | List all calendars in the user account |
| gcal_get_calendar | Get detailed calendar information |
| gcal_list_events | List events in a calendar within a time range |
| gcal_get_event | Get detailed event information |
| gcal_create_event | Create a new event in a calendar |
| gcal_update_event | Modify an existing event |
| gcal_delete_event | Delete an event from a calendar |
| gcal_quick_add_event | Create an event using natural language |
| gcal_get_free_busy | Check availability/free-busy information |
| gcal_list_colors | Get available color options for events |

## Configuration

Set your Google access token as an environment variable:

```bash
export GOOGLE_ACCESS_TOKEN="ya29...."
```

To get a Google access token:
1. Go to https://console.cloud.google.com/
2. Create or select a project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (Desktop app)
5. Authenticate to get an access token

## License

MIT
