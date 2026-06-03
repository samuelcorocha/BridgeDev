import { Inngest } from "inngest"

// eventKey é opcional em dev (Inngest Dev Server não exige autenticação)
export const inngest = new Inngest({
  id: "bridgedev",
  eventKey: process.env.INNGEST_EVENT_KEY,
})
