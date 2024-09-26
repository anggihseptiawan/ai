import {
  json,
  type ActionFunctionArgs,
  type MetaFunction,
} from "@remix-run/node"
import { Form, useActionData, useNavigation } from "@remix-run/react"
import { useEffect, useRef, useState } from "react"
import { Button } from "~/components/ui/button"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Textarea } from "~/components/ui/textarea"
import Anthropic from "@anthropic-ai/sdk"

export const meta: MetaFunction = () => {
  return [
    { title: "Asdevv AI" },
    { name: "description", content: "Asdevv AI!" },
  ]
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData()
  const message = body.get("message") || ""

  if (!message) return json({ data: { agent: "ai", content: "" } })
  const anthropic = new Anthropic()
  const response = await anthropic.messages.create(
    {
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 300,
      system: "Answer the questions clearly and concisely",
      messages: [{ role: "user", content: message as string }],
    },
    {
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY,
      },
    }
  )

  const content =
    response.content[0].type === "text"
      ? response.content[0].text
      : "Unknown response"
  return json({
    data: { agent: "ai", content },
  })
}

export default function Index() {
  const [chats, setChats] = useState<{ agent: "me" | "ai"; content: string }[]>(
    []
  )
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const actionData = useActionData<typeof action>()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const navigation = useNavigation()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [chats])

  useEffect(() => {
    if (actionData?.data) {
      setChats([...chats, { agent: "ai", content: actionData.data.content }])
    }
  }, [actionData])

  function addChat() {
    if (!inputRef.current) return
    setChats([...chats, { agent: "me", content: inputRef.current.value || "" }])
  }

  return (
    <div className="w-full md:w-3/4 mx-auto font-sans p-4">
      <h1 className="text-3xl text-center font-bold">Fun AI</h1>
      <div className="fixed w-full md:w-3/4 left-1 md:left-auto px-1 bottom-28">
        <ScrollArea className="h-[75vh] px-1 md:px-4 py-1">
          <div className="py-2">
            {chats.map((chat, idx) => (
              <div
                key={idx}
                className={`flex p-2 rounded-md mb-1 ${
                  chat.agent === "me"
                    ? "w-3/4 bg-violet-100 ml-auto"
                    : "w-10/12 mr-auto"
                }`}
              >
                {chat.agent === "ai" ? (
                  <pre className="w-full p-2 rounded-md leading-5 whitespace-pre-wrap bg-violet-100 overflow-x-auto font-sans">
                    {chat.content}
                  </pre>
                ) : (
                  <p>{chat.content}</p>
                )}
              </div>
            ))}
            {navigation.state === "submitting" && (
              <p className="mb-6">Thinking...</p>
            )}
          </div>
          <div ref={messagesEndRef} />
        </ScrollArea>
      </div>
      <div className="fixed w-full md:w-3/4 left-1 md:left-auto bottom-2">
        <Form method="POST" className="flex gap-1 md:gap-3 items-end">
          <div className="w-full">
            <small className="bg-violet-800 text-white py-1 px-2 rounded-md inline-block mb-1">
              Talk to Claude 3.5-sonet
            </small>
            <Textarea
              ref={inputRef}
              name="message"
              className="border border-violet-800"
              placeholder="What can I help you?"
            />
          </div>
          <Button
            type="submit"
            onClick={addChat}
            disabled={navigation.state === "submitting"}
          >
            {navigation.state === "submitting" ? "Waiting" : "Send"}
          </Button>
        </Form>
      </div>
    </div>
  )
}
