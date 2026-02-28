export type PollOption = {
  text: string
  isCorrect: boolean
}

export type PollPayload = {
  question: string
  timeLimit: number
  options: PollOption[]
}

