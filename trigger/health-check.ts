import { task } from "@trigger.dev/sdk"

export const healthCheck = task({
  id: "health-check",
  run: async () => ({
    ok: true,
    message: "Systemeta AI Trigger.dev worker is running",
  }),
})
