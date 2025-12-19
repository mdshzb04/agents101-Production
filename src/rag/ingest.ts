import 'dotenv/config'
import { Index as UpstashIndex } from '@upstash/vector'
import { parse } from 'csv-parse/sync'
import fs from 'fs'
import path from 'path'
import ora from 'ora'

// Initialize Upstash Vector client
const index = new UpstashIndex({
  url: process.env.UPSTASH_VECTOR_REST_URL as string,
  token: process.env.UPSTASH_VECTOR_REST_TOKEN as string,
})

// Function to index IMDB movie data
export async function indexMovieData() {
  const spinner = ora('Reading movie data...').start()

  // Read and parse CSV file
  const csvPath = path.join(process.cwd(), 'src/rag/imdb_movie_dataset.csv')
  const csvData = fs.readFileSync(csvPath, 'utf-8')
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true,
  })

  spinner.text = 'Starting movie indexing...'

  // Index each movie
  for (const movie of records) {
    spinner.text = `Indexing movie: ${movie.Title}`
    const text = `${movie.Title}. ${movie.Genre}. ${movie.Description}`

    try {
      await index.upsert({
        id: movie.Title, // Using Rank as unique ID
        data: text, // Text will be automatically embedded
        metadata: {
          title: movie.Title,
          year: movie.Year,
          genre: movie.Genre,
          director: movie.Director,
          actors: movie.Actors,
          rating: movie.Rating,
          votes: movie.Votes,
          revenue: movie.Revenue,
          metascore: movie.Metascore,
        },
      })
    } catch (error) {
      spinner.fail(`Error indexing movie ${movie.Title}`)
      console.error(error)
    }
  }

  spinner.succeed('Finished indexing movie data')
}
indexMovieData()