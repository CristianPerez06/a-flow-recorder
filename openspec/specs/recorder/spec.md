# recorder

## Purpose

The recorder capability lets a user record a browser flow against a target URL using Playwright codegen, and returns the generated script for them to copy.

## Requirements

### Requirement: Start a recording from a target URL

The system SHALL accept a target URL from the user and launch a Playwright codegen session against it, producing a JavaScript flow script when the session ends.

#### Scenario: User submits a valid URL

- **WHEN** the user submits a non-empty URL through the recorder form
- **THEN** the system launches a Playwright codegen browser window pointed at that URL and disables the form while the session is active

#### Scenario: User submits an empty or invalid URL

- **WHEN** the request body is missing `url`, contains a non-string `url`, or contains a value that cannot be parsed as a URL
- **THEN** the system responds with HTTP 400 and the error message `A valid URL is required.`

### Requirement: Return the generated script after the browser session ends

The system SHALL return the recorded Playwright script to the client once the codegen browser window is closed.

#### Scenario: User completes a flow and closes the browser

- **WHEN** the codegen process exits with status 0 and a script file was produced
- **THEN** the system responds with HTTP 200 and a JSON body `{ "script": "<recorded script>" }`

#### Scenario: User closes the browser without performing any action

- **WHEN** the codegen process exits but no script file is readable at the expected output path
- **THEN** the system responds with HTTP 500 and the error message `No script was produced (browser closed before any action?).`

#### Scenario: Codegen process exits with a non-zero status

- **WHEN** the codegen process exits with a non-zero, non-null exit code
- **THEN** the system responds with HTTP 500 and an error message including the exit code

### Requirement: Allow only one active recording at a time

The system SHALL serialize recordings so that no more than one Playwright codegen session is active per server process.

#### Scenario: A recording is already in progress

- **WHEN** a `POST /api/record` request arrives while another recording is still running
- **THEN** the system responds with HTTP 409 and the error message `A recording is already in progress.`

### Requirement: Reuse a persistent browser profile across recordings

The system SHALL persist the codegen browser profile to a stable per-user directory so that cookies, logins, and storage carry over between recording sessions.

#### Scenario: A new recording is started

- **WHEN** the server launches the codegen process
- **THEN** it passes `--user-data-dir` pointing at `~/.a-flow-recorder/profile`, creating the directory if it does not already exist

### Requirement: Clean up temporary script files

The system SHALL remove the temporary script file produced by codegen after reading it, regardless of whether the read succeeded.

#### Scenario: Script read succeeds

- **WHEN** the system has read the temporary script file into memory
- **THEN** it deletes the temporary file before returning the response

#### Scenario: Script read fails

- **WHEN** the temporary script file cannot be read
- **THEN** the system still attempts to delete the temporary file and ignores deletion errors

### Requirement: User can copy the generated script

The recorder UI SHALL allow the user to copy the generated script to the system clipboard and SHALL display a reminder to scrub sensitive data before sharing.

#### Scenario: User clicks the Copy button after a successful recording

- **WHEN** the user clicks `Copy` while a generated script is visible
- **THEN** the script is written to the clipboard and a visible reminder appears warning the user to remove sensitive data before sharing or saving

### Requirement: Recording route runs on the Node.js runtime

The `POST /api/record` route SHALL execute on the Node.js runtime and SHALL NOT be cached, because it spawns a child process and reads files from the local filesystem.

#### Scenario: Recording route configuration

- **WHEN** the route module is loaded
- **THEN** it exports `runtime = "nodejs"` and `dynamic = "force-dynamic"`, and declares a `maxDuration` large enough to cover a long interactive recording session (currently 3600 seconds)
