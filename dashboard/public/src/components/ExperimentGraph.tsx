import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
  } from 'recharts'
  
  import type { Experiment,ExperimentSet } from '@types'
  
  interface ExperimentGraphProps {
    experiment: Experiment
  }
  
  const ExperimentGraph = ({ experiment }: ExperimentGraphProps) => {
    const data = experiment.sets.map(
      (set: ExperimentSet, index: number) => ({
        name: `Set ${index + 1}`,
        score: set.score,
      })
    )
  
    return (
      <div>
        <h2>{experiment.name} Scores</h2>
  
        <LineChart width={600} height={400} data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis domain={[0, 1]} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="score" />
        </LineChart>
      </div>
    )
  }
  
  export default ExperimentGraph
  