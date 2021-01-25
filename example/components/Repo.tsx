import { usePromise } from  'with-next-promise-tree-walker'

interface VercelRepo {
  name: string
  description: string
  subscribers_count: number
  stargazers_count: number
  forks_count: number
}

const fetcher = (url: string) => fetch(url).then(res => res.json());

const Repo: React.FC = () => {
  const { isLoading, data, error } = usePromise<VercelRepo>('repos/vercel/swr', () => fetcher('https://api.github.com/repos/vercel/swr'), { ssr: true, skip: false });
  
  if (error) return <div>An error has occurred</div>;
  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No results found.</div>;
  
  return (
    <div>
      <h1>{data.name}</h1>
      <p>{data.description}</p>
      <strong>👀 {data.subscribers_count}</strong>{" "}
      <strong>✨ {data.stargazers_count}</strong>{" "}
      <strong>🍴 {data.forks_count}</strong>
    </div>
  );
}

export { Repo };