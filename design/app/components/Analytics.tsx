import { useState, useEffect } from "react";
import { getVideos, type Video } from "../lib/videos";
import { BarChart3, Clock, TrendingUp, Target, Calendar } from "lucide-react";
import { Card } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";

export function Analytics() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [stats, setStats] = useState({
    totalVideos: 0,
    completedVideos: 0,
    inProgressVideos: 0,
    totalHours: 0,
    watchedHours: 0,
    streak: 0,
    thisWeek: 0,
    topTags: [] as { tag: string; count: number }[],
  });

  useEffect(() => {
    const allVideos = getVideos();
    const activeVideos = allVideos.filter(v => !v.archived);
    setVideos(activeVideos);

    // Calculate stats
    const completed = activeVideos.filter(v => v.watchProgress === 100).length;
    const inProgress = activeVideos.filter(v => v.watchProgress > 0 && v.watchProgress < 100).length;
    
    const totalSeconds = activeVideos.reduce((acc, v) => acc + v.durationSeconds, 0);
    const watchedSeconds = activeVideos.reduce((acc, v) => 
      acc + (v.durationSeconds * v.watchProgress / 100), 0
    );

    // Calculate streak (mock for now - could track actual viewing days)
    const streak = 7;

    // Videos added this week
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const thisWeek = activeVideos.filter(v => new Date(v.dateAdded) > weekAgo).length;

    // Top tags
    const tagCounts = new Map<string, number>();
    activeVideos.forEach(v => {
      v.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    const topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    setStats({
      totalVideos: activeVideos.length,
      completedVideos: completed,
      inProgressVideos: inProgress,
      totalHours: totalSeconds / 3600,
      watchedHours: watchedSeconds / 3600,
      streak,
      thisWeek,
      topTags,
    });
  }, []);

  const completionRate = stats.totalVideos > 0
    ? Math.round((stats.completedVideos / stats.totalVideos) * 100)
    : 0;

  const watchTimeProgress = stats.totalHours > 0
    ? Math.round((stats.watchedHours / stats.totalHours) * 100)
    : 0;

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
            Analytics
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Track your learning progress and insights
          </p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card className="p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <BarChart3 className="size-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Completion Rate</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {completionRate}%
                </p>
              </div>
            </div>
            <Progress value={completionRate} className="h-2" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2">
              {stats.completedVideos} of {stats.totalVideos} completed
            </p>
          </Card>

          <Card className="p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Clock className="size-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Watch Time</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {Math.round(stats.watchedHours)}h
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {Math.round(stats.totalHours - stats.watchedHours)}h remaining
            </p>
          </Card>

          <Card className="p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Target className="size-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Learning Streak</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.streak} days
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Keep it up! 🔥</p>
          </Card>

          <Card className="p-6 border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                <Calendar className="size-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">This Week</p>
                <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
                  {stats.thisWeek}
                </p>
              </div>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">videos added</p>
          </Card>
        </div>

        {/* Progress Breakdown */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <Card className="p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Progress Breakdown
            </h2>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Completed</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {stats.completedVideos} videos
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalVideos > 0 ? (stats.completedVideos / stats.totalVideos) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">In Progress</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {stats.inProgressVideos} videos
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{
                      width: `${stats.totalVideos > 0 ? (stats.inProgressVideos / stats.totalVideos) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Not Started</span>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {stats.totalVideos - stats.completedVideos - stats.inProgressVideos} videos
                  </span>
                </div>
                <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-zinc-300 dark:bg-zinc-600 h-2 rounded-full"
                    style={{
                      width: `${stats.totalVideos > 0 ? ((stats.totalVideos - stats.completedVideos - stats.inProgressVideos) / stats.totalVideos) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 border border-zinc-200 dark:border-zinc-800">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
              Top Topics
            </h2>
            {stats.topTags.length > 0 ? (
              <div className="space-y-3">
                {stats.topTags.map((item, index) => (
                  <div key={item.tag} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {index + 1}
                    </div>
                    <Badge variant="secondary" className="text-sm">
                      {item.tag}
                    </Badge>
                    <span className="ml-auto text-sm text-zinc-600 dark:text-zinc-400">
                      {item.count} videos
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                No tags yet. Add tags to your videos to see insights.
              </p>
            )}
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="p-6 border border-zinc-200 dark:border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">
            Recently Watched
          </h2>
          <div className="space-y-3">
            {videos
              .filter(v => v.lastWatched)
              .sort((a, b) => 
                new Date(b.lastWatched!).getTime() - new Date(a.lastWatched!).getTime()
              )
              .slice(0, 5)
              .map(video => (
                <div key={video.id} className="flex items-center gap-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-32 h-20 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {video.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                      {video.channel} • {video.duration}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Badge
                      variant={video.watchProgress === 100 ? "default" : "secondary"}
                      className={video.watchProgress === 100 ? "bg-green-500" : ""}
                    >
                      {video.watchProgress}%
                    </Badge>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400">
                      {new Date(video.lastWatched!).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
