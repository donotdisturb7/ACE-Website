interface AdminTeam {
  id: string;
  name: string;
  memberCount: number;
  isComplete: boolean;
  roomNumber: number | null;
  currentScore: number;
  rank: number | null;
}

interface AdminTeamsListProps {
  teams: AdminTeam[];
  roomNames?: Record<string, string>;
}

export default function AdminTeamsList({ teams, roomNames = {} }: AdminTeamsListProps) {
  return (
    <div className="space-y-6">
      <h2 className="font-display text-2xl font-bold text-white">
        Toutes les Équipes ({teams.length})
      </h2>

      <div className="glass-panel rounded-2xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface border-b border-white/10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Nom
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Membres
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Salle
                </th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Score
                </th>
              </tr>
            </thead>
            <tbody>
              {teams.map((team) => (
                <tr key={team.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">{team.name}</td>
                  <td className="px-6 py-4 text-gray-300">{team.memberCount} / 5</td>
                  <td className="px-6 py-4">
                    {team.isComplete ? (
                      <span className="text-green-400 font-medium">Complète</span>
                    ) : (
                      <span className="text-yellow-400">Incomplète</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {team.roomNumber ? (roomNames[team.roomNumber] || `Salle ${team.roomNumber}`) : '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {team.currentScore} pts
                    {team.rank && <span className="text-gray-400 ml-2">#{team.rank}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

