/**
 * Google Calendar API Client
 * 
 * Handles all communication with Google Calendar API v3
 * - Authentication via OAuth2 access token
 * - Rate limiting (10 req/s)
 * - Automatic retry on 429
 */

const BASE_URL = "https://www.googleapis.com/calendar/v3";
const RATE_LIMIT_DELAY_MS = 100; // 10 req/s = 100ms between requests

let lastRequestTime = 0;

/**
 * Calendar List Item
 */
export interface CalendarListItem {
  kind: string;
  etag: string;
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  selected?: boolean;
  accessRole?: string;
  defaultReminders?: Array<{
    method: string;
    minutes: number;
  }>;
  primary?: boolean;
}

/**
 * Calendar Resource
 */
export interface Calendar {
  kind: string;
  etag: string;
  id: string;
  summary: string;
  description?: string;
  timeZone?: string;
}

/**
 * Event Resource
 */
export interface CalendarEvent {
  kind?: string;
  etag?: string;
  id?: string;
  status?: string;
  htmlLink?: string;
  created?: string;
  updated?: string;
  summary?: string;
  description?: string;
  location?: string;
  colorId?: string;
  creator?: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  organizer?: {
    id?: string;
    email?: string;
    displayName?: string;
    self?: boolean;
  };
  start?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  end?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  endTimeUnspecified?: boolean;
  recurrence?: string[];
  recurringEventId?: string;
  originalStartTime?: {
    date?: string;
    dateTime?: string;
    timeZone?: string;
  };
  transparency?: string;
  visibility?: string;
  iCalUID?: string;
  sequence?: number;
  attendees?: Array<{
    id?: string;
    email?: string;
    displayName?: string;
    organizer?: boolean;
    self?: boolean;
    resource?: boolean;
    optional?: boolean;
    responseStatus?: string;
    comment?: string;
    additionalGuests?: number;
  }>;
  attendeesOmitted?: boolean;
  extendedProperties?: {
    private?: Record<string, string>;
    shared?: Record<string, string>;
  };
  hangoutLink?: string;
  conferenceData?: any;
  gadget?: any;
  anyoneCanAddSelf?: boolean;
  guestsCanInviteOthers?: boolean;
  guestsCanModify?: boolean;
  guestsCanSeeOtherGuests?: boolean;
  privateCopy?: boolean;
  locked?: boolean;
  reminders?: {
    useDefault?: boolean;
    overrides?: Array<{
      method: string;
      minutes: number;
    }>;
  };
  source?: {
    url?: string;
    title?: string;
  };
  attachments?: Array<{
    fileUrl?: string;
    title?: string;
    mimeType?: string;
    iconLink?: string;
    fileId?: string;
  }>;
  eventType?: string;
}

/**
 * Free/Busy Request
 */
export interface FreeBusyRequest {
  timeMin: string;
  timeMax: string;
  timeZone?: string;
  groupExpansionMax?: number;
  calendarExpansionMax?: number;
  items: Array<{
    id: string;
  }>;
}

/**
 * Free/Busy Response
 */
export interface FreeBusyResponse {
  kind: string;
  timeMin: string;
  timeMax: string;
  calendars: Record<string, {
    errors?: Array<{
      domain: string;
      reason: string;
    }>;
    busy: Array<{
      start: string;
      end: string;
    }>;
  }>;
}

/**
 * Colors Response
 */
export interface ColorsResponse {
  kind: string;
  updated: string;
  calendar: Record<string, {
    background: string;
    foreground: string;
  }>;
  event: Record<string, {
    background: string;
    foreground: string;
  }>;
}

/**
 * Google Calendar API Client
 */
export class GoogleCalendarClient {
  private accessToken: string;

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error("GOOGLE_ACCESS_TOKEN is required");
    }
    this.accessToken = accessToken;
  }

  /**
   * Rate limiter: enforce 10 req/s max
   */
  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - lastRequestTime;
    if (elapsed < RATE_LIMIT_DELAY_MS) {
      await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_DELAY_MS - elapsed));
    }
    lastRequestTime = Date.now();
  }

  /**
   * Generic API request with retry on 429
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any,
    params?: Record<string, string>
  ): Promise<T> {
    await this.rateLimit();

    const url = new URL(`${BASE_URL}${path}`);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, value);
        }
      });
    }

    const options: RequestInit = {
      method,
      headers: {
        "Authorization": `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    let response = await fetch(url.toString(), options);

    // Retry on 429 with Retry-After
    if (response.status === 429) {
      const retryAfter = response.headers.get("Retry-After");
      const delayMs = retryAfter ? parseInt(retryAfter, 10) * 1000 : 1000;
      await new Promise(resolve => setTimeout(resolve, delayMs));
      response = await fetch(url.toString(), options);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Google Calendar API error (${response.status}): ${errorText}`);
    }

    // DELETE returns 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json() as T;
  }

  /**
   * List all calendars in the user's calendar list
   */
  async listCalendars(pageToken?: string): Promise<{
    kind: string;
    etag: string;
    nextPageToken?: string;
    items: CalendarListItem[];
  }> {
    const params: Record<string, string> = {};
    if (pageToken) params.pageToken = pageToken;

    return this.request("GET", "/users/me/calendarList", undefined, params);
  }

  /**
   * Get a specific calendar by ID
   */
  async getCalendar(calendarId: string): Promise<Calendar> {
    return this.request("GET", `/calendars/${encodeURIComponent(calendarId)}`);
  }

  /**
   * List events in a calendar
   */
  async listEvents(
    calendarId: string,
    timeMin?: string,
    timeMax?: string,
    q?: string,
    maxResults?: number,
    pageToken?: string,
    singleEvents?: boolean,
    orderBy?: string
  ): Promise<{
    kind: string;
    etag: string;
    summary: string;
    updated: string;
    timeZone: string;
    accessRole: string;
    defaultReminders: any[];
    nextPageToken?: string;
    items: CalendarEvent[];
  }> {
    const params: Record<string, string> = {};
    if (timeMin) params.timeMin = timeMin;
    if (timeMax) params.timeMax = timeMax;
    if (q) params.q = q;
    if (maxResults) params.maxResults = maxResults.toString();
    if (pageToken) params.pageToken = pageToken;
    if (singleEvents !== undefined) params.singleEvents = singleEvents.toString();
    if (orderBy) params.orderBy = orderBy;

    return this.request("GET", `/calendars/${encodeURIComponent(calendarId)}/events`, undefined, params);
  }

  /**
   * Get a specific event
   */
  async getEvent(calendarId: string, eventId: string): Promise<CalendarEvent> {
    return this.request("GET", `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`);
  }

  /**
   * Create a new event
   */
  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEvent> {
    return this.request("POST", `/calendars/${encodeURIComponent(calendarId)}/events`, event);
  }

  /**
   * Update an existing event
   */
  async updateEvent(calendarId: string, eventId: string, event: CalendarEvent): Promise<CalendarEvent> {
    return this.request("PUT", `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`, event);
  }

  /**
   * Delete an event
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<void> {
    await this.request("DELETE", `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`);
  }

  /**
   * Quick add event from natural language text
   */
  async quickAddEvent(calendarId: string, text: string): Promise<CalendarEvent> {
    const params = { text };
    return this.request("POST", `/calendars/${encodeURIComponent(calendarId)}/events/quickAdd`, undefined, params);
  }

  /**
   * Get free/busy information for calendars
   */
  async getFreeBusy(request: FreeBusyRequest): Promise<FreeBusyResponse> {
    return this.request("POST", "/freeBusy", request);
  }

  /**
   * List available colors for calendars and events
   */
  async listColors(): Promise<ColorsResponse> {
    return this.request("GET", "/colors");
  }
}
