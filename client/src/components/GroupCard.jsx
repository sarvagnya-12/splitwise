import { Link } from 'react-router-dom';

const GroupCard = ({ group }) => {
  const memberCount = group.members?.length || 0;

  return (
    <Link to={`/group/${group._id}`} className="block">
      <div className="glass-card p-5 cursor-pointer group">
        <div className="flex items-start justify-between mb-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-700/20 border border-primary-500/20 flex items-center justify-center group-hover:from-primary-500/30 group-hover:to-primary-700/30 transition-all duration-300">
            <svg className="w-5 h-5 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <span className="text-xs text-dark-400 bg-dark-700/50 px-2.5 py-1 rounded-full">
            {memberCount} member{memberCount !== 1 ? 's' : ''}
          </span>
        </div>

        <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-primary-300 transition-colors">
          {group.name}
        </h3>

        <p className="text-dark-400 text-sm">
          Created by {group.createdBy?.name || 'Unknown'}
        </p>

        {/* Member avatars */}
        <div className="flex items-center mt-4 -space-x-2">
          {group.members?.slice(0, 5).map((member, idx) => (
            <div
              key={member._id || idx}
              className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-xs font-bold border-2 border-dark-800"
              title={member.name}
            >
              {member.name?.charAt(0).toUpperCase()}
            </div>
          ))}
          {memberCount > 5 && (
            <div className="w-7 h-7 rounded-full bg-dark-600 flex items-center justify-center text-dark-300 text-xs font-bold border-2 border-dark-800">
              +{memberCount - 5}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default GroupCard;
