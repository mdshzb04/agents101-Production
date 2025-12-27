import 'dotenv/config'
import type { Score, Scorer } from 'autoevals'
import chalk from 'chalk'
import { JSONFilePreset } from 'lowdb/node'


type RunScore = {
  name: Score['name']
  score: NonNullable<Score['score']>
}

type Run<T = unknown> = {
  input: unknown
  output: T
  expected?: T
  scores: RunScore[]
  createdAt: string
}


type ExperimentSet<T = unknown> = {
  runs: Run<T>[]
  score: number
  createdAt: string
}


type Experiment<T = unknown> = {
  name: string
  sets: ExperimentSet<T>[]
}


type Data = {
  experiments: Experiment<any>[]
}


const defaultData: Data = {
  experiments: [],
}

const getDb = async () => {
  return JSONFilePreset<Data>('results.json', defaultData)
}


const calculateAvgScore = <T>(runs: Run<T>[]): number => {

  if (runs.length === 0) return 0

  const total = runs.reduce((sum, run) => {
    if (run.scores.length === 0) return sum

    const runAvg =
      run.scores.reduce((s, sc) => s + sc.score, 0) / run.scores.length

    return sum + runAvg
  }, 0)

  return total / runs.length
}


export const loadExperiment = async (
  experimentName: string
): Promise<Experiment | undefined> => {
  const db = await getDb()
  return db.data.experiments.find((e) => e.name === experimentName)
}

export const saveSet = async (
  experimentName: string,
  runs: Omit<Run<any>, 'createdAt'>[]

) => {
  const db = await getDb()

  const now = new Date().toISOString()

  const runsWithTimestamp: Run[] = runs.map((run) => ({
    ...run,
    createdAt: now,
  }))

  const newSet: ExperimentSet = {
    runs: runsWithTimestamp,
    score: calculateAvgScore(runsWithTimestamp),
    createdAt: now,
  }

  const experiment = db.data.experiments.find(
    (e) => e.name === experimentName
  )

  if (experiment) {
    experiment.sets.push(newSet)
  } else {
    db.data.experiments.push({
      name: experimentName,
      sets: [newSet],
    })
  }

  await db.write()
}


type TaskResult<T> =
  | T
  | {
      response: T
      context?: string | string[]
    }

export const runEval = async <T>(
  experiment: string,
  {
    task,
    data,
    scorers,
  }: {
    task: (input: unknown) => Promise<TaskResult<T>>
    data: { input: unknown; expected?: T; reference?: string | string[] }[]
    scorers: Scorer<T, unknown>[]
  }
): Promise<Run<T>[]> => {

  const results: Run<T>[] = await Promise.all(
    data.map(async ({ input, expected, reference }) => {
      const taskResult = await task(input)

      let output: T
      let context: string | string[] | undefined

      if (
        typeof taskResult === 'object' &&
        taskResult !== null &&
        'response' in taskResult
      ) {
        output = taskResult.response
        context = taskResult.context
      } else {
        output = taskResult
      }

      const scores: RunScore[] = await Promise.all(
        scorers.map(async (scorer) => {
          const s = await scorer({
            input,
            output,
            expected,
            reference,
            context,
          })

          return {
            name: s.name,
            score: s.score ?? 0,
          }
        })
      )

      return {
        input,
        output,
        expected,
        scores,
        createdAt: new Date().toISOString(),
      }
    })
  )

  const previousExperiment = await loadExperiment(experiment)
  const previousScore =
    previousExperiment?.sets.at(-1)?.score ?? 0

  const currentScore = calculateAvgScore(results)
  const scoreDiff = currentScore - previousScore

  const color = previousExperiment
    ? scoreDiff > 0
      ? chalk.green
      : scoreDiff < 0
      ? chalk.red
      : chalk.blue
    : chalk.blue

  console.log(`Experiment: ${experiment}`)
  console.log(`Previous score: ${color(previousScore.toFixed(2))}`)
  console.log(`Current score: ${color(currentScore.toFixed(2))}`)
  console.log(
    `Difference: ${scoreDiff > 0 ? '+' : ''}${color(scoreDiff.toFixed(2))}`
  )
  console.log()

  await saveSet(experiment, results)

  return results
}
