# AI-Chat-Workflows-Automation-App

Rocket.Chat App for generating functional automated chat workflows using LLMs.

## Getting Started

### Requirements
- Node.js v20.18.1
- Unix-based OS (Linux, macOS, WSL2)

## Part 1: Deploying the App

#### 1. Install the Rocket.Chat Apps CLI
Install `rc-apps` globally:

```bash
npm install -g @rocket.chat/apps-cli
```

Verify the installation:

```bash
rc-apps -v
```

You should see the CLI version information:

```bash
@rocket.chat/apps-cli/1.12.0 darwin-arm64 node-v20.18.1
```

> **Note:** The platform information (e.g., "darwin-arm64") will differ depending on your operating system.

#### 2. Clone the repository

```bash
git clone https://github.com/RocketChat/Apps.AutomatedChatWorkflows.git
```

#### 3. Navigate to the app directory

```bash
cd Apps.AutomatedChatWorkflows
```

#### 4. Install dependencies

```bash
npm install
```

#### 5A. Build your app, configure and deploy

```bash
rc-apps package
```

Edit the `.rcappsconfig` file with your credentials:

```json
{
  "url": "https://workspace_server_url",
  "username": "your_username",
  "password": "your_password"
}
```

Deploy your app:

```bash
rc-apps deploy
```

#### 5B. Build and deploy using single command

Instead of following 5A, you can run the command below to build and deploy it in one go.

```bash
rc-apps deploy --url <enter server url here> --username <enter username here> --password <enter password here>
```

If I'm deploying to localhost:3000 and my username is 'dhairyashil' and my password is 'Pass@123', the command would be:

```bash
rc-apps deploy --url http://localhost:3000 --username dhairyashil --password Pass@123
```

<div align='center' width='100%'>
<a href="https://github.com/RocketChat/Apps.AutomatedChatWorkflows/graphs/contributors">
<img src="https://open-source-assets.middlewarehq.com/svgs/RocketChat-Apps.AutomatedChatWorkflows-contributor-metrics-dark-widget.svg?caching=true"></img>
</a>
</div>

### Contributors

<a href="https://github.com/RocketChat/Apps.AutomatedChatWorkflows/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=RocketChat/Apps.AutomatedChatWorkflows" />
</a>
