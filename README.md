# Hubot Slack Overflow

Share [Stack Overflow](https://stackoverflow.com) answers with your [Slack](https://slack.com/) team using [Hubot](https://hubot.github.com/)

## Installation

`npm install hubot-slack-overflow --save`

Then add **hubot-slack-overflow** to your `external-scripts.json`:

```
[
  "hubot-slack-overflow"
]
```

## Configuration

Set the STACK_OVERFLOW_KEY environment variable to your [StackExchange API Key](https://api.stackexchange.com/docs), e.g.:

```
export STACK_OVERFLOW_KEY=supersecret
bin/hubot --adapter slack
```

## Commands

 * overflow `query` - searches Stack Overflow for `query`
