import { getComments, getScores } from "./actions";
import { LeaderboardClient } from "./leaderboard-client";

// Los datos cambian con cada partida/comentario: renderizado dinámico.
export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const [comments, scores] = await Promise.all([getComments(), getScores()]);

  return <LeaderboardClient comments={comments} scores={scores} />;
}
