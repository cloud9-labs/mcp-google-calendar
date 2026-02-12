import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { GoogleCalendarClient, CalendarEvent } from "./client.js";
import {
  ListCalendarsSchema,
  GetCalendarSchema,
  ListEventsSchema,
  GetEventSchema,
  CreateEventSchema,
  UpdateEventSchema,
  DeleteEventSchema,
  QuickAddEventSchema,
  GetFreeBusySchema,
  ListColorsSchema,
} from "./schemas.js";

export function registerTools(server: McpServer, accessToken: string): void {
  let _client: GoogleCalendarClient | null = null;
  const getClient = () => { if (!_client) _client = new GoogleCalendarClient(accessToken); return _client; };

  server.tool("gcal_list_calendars", "List all calendars in the user's calendar list.", ListCalendarsSchema.shape, async ({ pageToken }) => {
    try {
      const result = await getClient().listCalendars(pageToken);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_get_calendar", "Get details of a specific calendar.", GetCalendarSchema.shape, async ({ calendarId }) => {
    try {
      const result = await getClient().getCalendar(calendarId);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_list_events", "List events in a calendar.", ListEventsSchema.shape, async ({ calendarId, timeMin, timeMax, q, maxResults, pageToken, singleEvents, orderBy }) => {
    try {
      const result = await getClient().listEvents(calendarId, timeMin, timeMax, q, maxResults, pageToken, singleEvents, orderBy);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_get_event", "Get details of a specific event.", GetEventSchema.shape, async ({ calendarId, eventId }) => {
    try {
      const result = await getClient().getEvent(calendarId, eventId);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_create_event", "Create a new event.", CreateEventSchema.shape, async ({ calendarId, summary, description, location, start, end, attendees, reminders, colorId, transparency, visibility }) => {
    try {
      const event: CalendarEvent = {
        summary,
        description,
        location,
        start,
        end,
        attendees,
        reminders,
        colorId,
        transparency,
        visibility,
      };
      const result = await getClient().createEvent(calendarId, event);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_update_event", "Update an existing event.", UpdateEventSchema.shape, async ({ calendarId, eventId, summary, description, location, start, end, attendees, reminders, colorId, transparency, visibility }) => {
    try {
      const event: CalendarEvent = {};
      if (summary !== undefined) event.summary = summary;
      if (description !== undefined) event.description = description;
      if (location !== undefined) event.location = location;
      if (start !== undefined) event.start = start;
      if (end !== undefined) event.end = end;
      if (attendees !== undefined) event.attendees = attendees;
      if (reminders !== undefined) event.reminders = reminders;
      if (colorId !== undefined) event.colorId = colorId;
      if (transparency !== undefined) event.transparency = transparency;
      if (visibility !== undefined) event.visibility = visibility;

      const result = await getClient().updateEvent(calendarId, eventId, event);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_delete_event", "Delete an event.", DeleteEventSchema.shape, async ({ calendarId, eventId }) => {
    try {
      await getClient().deleteEvent(calendarId, eventId);
      return { content: [{ type: "text" as const, text: `Event ${eventId} deleted successfully from calendar ${calendarId}` }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_quick_add_event", "Quick add event from natural language.", QuickAddEventSchema.shape, async ({ calendarId, text }) => {
    try {
      const result = await getClient().quickAddEvent(calendarId, text);
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_get_free_busy", "Get free/busy information for calendars.", GetFreeBusySchema.shape, async ({ timeMin, timeMax, items, timeZone }) => {
    try {
      const result = await getClient().getFreeBusy({ timeMin, timeMax, items, timeZone });
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });

  server.tool("gcal_list_colors", "List available colors for calendars and events.", ListColorsSchema.shape, async () => {
    try {
      const result = await getClient().listColors();
      return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
    } catch (error) { return errorResult(error); }
  });
}

function errorResult(error: unknown) {
  const message = error instanceof Error ? error.message : "An unknown error occurred";
  return { content: [{ type: "text" as const, text: `Error: ${message}` }], isError: true };
}
