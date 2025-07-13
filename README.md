# Weather MCP Server

A Model Context Protocol (MCP) server that provides weather information using the National Weather Service (NWS) API.

## Features

- **Current Weather**: Get current weather conditions for any location using latitude and longitude coordinates
- **Weather Forecast**: Get a 3-day weather forecast for any location
- **Real-time Data**: Uses the official National Weather Service API for accurate, up-to-date weather information

## Installation

```bash
npm install
```

## Building

```bash
npm run build
```

## Usage

The server can be used as an MCP tool in any MCP-compatible client. It provides two main tools:

### getCurrentWeather

Get the current weather for a specific location.

**Parameters:**

- `latitude` (number): The latitude of the location
- `longitude` (number): The longitude of the location

**Example:**

```json
{
  "latitude": 40.7128,
  "longitude": -74.006
}
```

### getForecast

Get a 3-day weather forecast for a specific location.

**Parameters:**

- `latitude` (number): The latitude of the location
- `longitude` (number): The longitude of the location

**Example:**

```json
{
  "latitude": 40.7128,
  "longitude": -74.006
}
```

## API Information

This server uses the National Weather Service (NWS) API:

- Base URL: `https://api.weather.gov`
- No API key required
- Provides free, real-time weather data for the United States

## Development

The server is built with TypeScript and uses the MCP SDK. The main implementation is in `src/index.ts`.

### Project Structure

```
├── src/
│   └── index.ts          # Main server implementation
├── build/                # Compiled JavaScript output
├── package.json          # Dependencies and scripts
└── tsconfig.json         # TypeScript configuration
```

## License

ISC
