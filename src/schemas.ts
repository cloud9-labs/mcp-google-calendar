/**
 * Zod schemas for Google Calendar MCP tools
 */

import { z } from "zod";

/**
 * List all calendars in the user's calendar list
 */
export const ListCalendarsSchema = z.object({
  pageToken: z.string().optional().describe("Token for pagination to retrieve next page of results"),
});

/**
 * Get details of a specific calendar
 */
export const GetCalendarSchema = z.object({
  calendarId: z.string().describe("Calendar identifier (use 'primary' for the primary calendar)"),
});

/**
 * List events in a calendar
 */
export const ListEventsSchema = z.object({
  calendarId: z.string().describe("Calendar identifier (use 'primary' for the primary calendar)"),
  timeMin: z.string().optional().describe("Lower bound (inclusive) for event start time (RFC3339 timestamp, e.g., '2024-01-01T00:00:00Z')"),
  timeMax: z.string().optional().describe("Upper bound (exclusive) for event start time (RFC3339 timestamp)"),
  q: z.string().optional().describe("Free text search query to filter events"),
  maxResults: z.number().optional().describe("Maximum number of events to return (1-2500, default: 250)"),
  pageToken: z.string().optional().describe("Token for pagination to retrieve next page of results"),
  singleEvents: z.boolean().optional().describe("Whether to expand recurring events into instances (default: false)"),
  orderBy: z.enum(["startTime", "updated"]).optional().describe("Order of events ('startTime' requires singleEvents=true)"),
});

/**
 * Get details of a specific event
 */
export const GetEventSchema = z.object({
  calendarId: z.string().describe("Calendar identifier (use 'primary' for the primary calendar)"),
  eventId: z.string().describe("Event identifier"),
});

/**
 * Create a new event
 */
export const CreateEventSchema = z.object({
  calendarId: z.string().describe("Calendar identifier (use 'primary' for the primary calendar)"),
  summary: z.string().describe("Title of the event"),
  description: z.string().optional().describe("Description of the event"),
  location: z.string().optional().describe("Location of the event"),
  start: z.object({
    dateTime: z.string().optional().describe("Start time as RFC3339 timestamp (e.g., '2024-01-01T10:00:00Z' or '2024-01-01T10:00:00+09:00')"),
    date: z.string().optional().describe("Start date for all-day events (YYYY-MM-DD format)"),
    timeZone: z.string().optional().describe("Time zone (e.g., 'Asia/Tokyo', 'America/New_York')"),
  }).describe("Start time of the event"),
  end: z.object({
    dateTime: z.string().optional().describe("End time as RFC3339 timestamp"),
    date: z.string().optional().describe("End date for all-day events (YYYY-MM-DD format)"),
    timeZone: z.string().optional().describe("Time zone (e.g., 'Asia/Tokyo', 'America/New_York')"),
  }).describe("End time of the event"),
  attendees: z.array(z.object({
    email: z.string().describe("Email address of the attendee"),
    displayName: z.string().optional().describe("Display name of the attendee"),
    optional: z.boolean().optional().describe("Whether attendance is optional"),
    responseStatus: z.string().optional().describe("Response status: 'needsAction', 'declined', 'tentative', 'accepted'"),
  })).optional().describe("List of attendees"),
  reminders: z.object({
    useDefault: z.boolean().optional().describe("Whether to use default reminders"),
    overrides: z.array(z.object({
      method: z.enum(["email", "popup"]).describe("Reminder method"),
      minutes: z.number().describe("Minutes before event to send reminder"),
    })).optional().describe("Custom reminder overrides"),
  }).optional().describe("Reminder settings"),
  colorId: z.string().optional().describe("Color ID (use gcal_list_colors to see available colors)"),
  transparency: z.enum(["opaque", "transparent"]).optional().describe("Whether event blocks time on calendar"),
  visibility: z.enum(["default", "public", "private", "confidential"]).optional().describe("Visibility of the event"),
});

/**
 * Update an existing event
 */
export const UpdateEventSchema = z.object({
  calendarId: z.string().describe("Calendar identifier (use 'primary' for the primary calendar)"),
  eventId: z.string().describe("Event identifier to update"),
  summary: z.string().optional().describe("Title of the event"),
  description: z.string().optional().describe("Description of the event"),
  location: z.string().optional().describe("Location of the event"),
  start: z.object({
    dateTime: z.string().optional().describe("Start time as RFC3339 timestamp"),
    date: z.string().optional().describe("Start date for all-day events (YYYY-MM-DD format)"),
    timeZone: z.string().optional().describe("Time zone (e.g., 'Asia/Tokyo', 'America/New_York')"),
  }).optional().describe("Start time of the event"),
  end: z.object({
    dateTime: z.string().optional().describe("End time as RFC3339 timestamp"),
    date: z.string().optional().describe("End date for all-day events (YYYY-MM-DD format)"),
    timeZone: z.string().optional().describe("Time zone (e.g., 'Asia/Tokyo', 'America/New_York')"),
  }).optional().describe("End time of the event"),
  attendees: z.array(z.object({
    email: z.string().describe("Email address of the attendee"),
    displayName: z.string().optional().describe("Display name of the attendee"),
    optional: z.boolean().optional().describe("Whether attendance is optional"),
    responseStatus: z.string().optional().describe("Response status: 'needsAction', 'declined', 'tentative', 'accepted'"),
  })).optional().describe("List of attendees"),
  reminders: z.object({
    useDefault: z.boolean().optional().describe("Whether to use default reminders"),
    overrides: z.array(z.object({
      method: z.enum(["email", "popup"]).describe("Reminder method"),
      minutes: z.number().describe("Minutes before event to send reminder"),
    })).optional().describe("Custom reminder overrides"),
  }).optional().describe("Reminder settings"),
  colorId: z.string().optional().describe("Color ID (use gcal_list_colors to see available colors)"),
  transparency: z.enum(["opaque", "transparent"]).optional().describe("Whether event blocks time on calendar"),
  visibility: z.enum(["default", "public", "private", "confidential"]).optional().describe("Visibility of the event"),
});

/**
 * Delete an event
 */
export const DeleteEventSchema = z.object({
  calendarId: z.string().describe("Calendar identifier (use 'primary' for the primary calendar)"),
  eventId: z.string().describe("Event identifier to delete"),
});

/**
 * Quick add event from natural language
 */
export const QuickAddEventSchema = z.object({
  calendarId: z.string().describe("Calendar identifier (use 'primary' for the primary calendar)"),
  text: z.string().describe("Natural language description (e.g., 'Lunch with John tomorrow at 12pm' or 'Team meeting next Monday 10am-11am')"),
});

/**
 * Get free/busy information
 */
export const GetFreeBusySchema = z.object({
  timeMin: z.string().describe("Start of the interval (RFC3339 timestamp, e.g., '2024-01-01T00:00:00Z')"),
  timeMax: z.string().describe("End of the interval (RFC3339 timestamp)"),
  items: z.array(z.object({
    id: z.string().describe("Calendar identifier to check"),
  })).describe("List of calendars to query for busy times"),
  timeZone: z.string().optional().describe("Time zone for the query (e.g., 'Asia/Tokyo', 'America/New_York')"),
});

/**
 * List available colors
 */
export const ListColorsSchema = z.object({});
