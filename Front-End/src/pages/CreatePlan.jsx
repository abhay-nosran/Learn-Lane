import React, { useMemo, useState, useEffect } from 'react';

// Mock dataset to search from (replace later with AI/API)
const CATALOG = [
  { id: 'g-1', title: 'Graph Basics', type: 'topic', summary: 'Vertices, edges, adjacency, degrees.' },
  { id: 'g-2', title: 'BFS & DFS', type: 'topic', summary: 'Traversal strategies, tree/graph variants.' },
  { id: 'g-3', title: 'Shortest Paths (Dijkstra)', type: 'topic', summary: 'Greedy relaxation, PQ optimization.' },
  { id: 'g-4', title: 'Bellman-Ford', type: 'topic', summary: 'Negative edges, dynamic relaxation.' },
  { id: 'g-5', title: 'Topological Sort', type: 'topic', summary: 'DAG ordering, Kahn vs DFS.' },
  { id: 'g-6', title: 'Strongly Connected Components', type: 'topic', summary: 'Kosaraju, Tarjan, low-link.' },
  { id: 'r-1', title: 'GfG Graph Series', type: 'resource', summary: 'Practice articles and problems.' },
  { id: 'r-2', title: 'CP-Algorithms Graphs', type: 'resource', summary: 'In-depth notes and proofs.' },
  { id: 'r-3', title: 'MIT 6.006 Graph Lectures', type: 'resource', summary: 'Video lectures and slides.' },
];

// Utility to generate initial day slots
const makeDays = (count = 7) =>
  Array.from({ length: count }, (_, i) => ({
    day: i + 1,
    items: [],
  }));

const CreatePlan = () => {
  const [query, setQuery] = useState('');
  const [days, setDays] = useState(makeDays(7));
  const [selected, setSelected] = useState(null); // selected search item
  const [centerNote, setCenterNote] = useState('Select a topic or resource from the left to preview here.');

  // New state for learning plan generation
  const [topicSearch, setTopicSearch] = useState('');
  const [debouncedTopic, setDebouncedTopic] = useState('');
  const [duration, setDuration] = useState(7);
  const [skillLevel, setSkillLevel] = useState('Intermediate');
  const [learningType, setLearningType] = useState('Mixed');
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [allPlans, setAllPlans] = useState([]); // Store all generated plans
  const [planProgress, setPlanProgress] = useState({});
  const [showPlanGenerator, setShowPlanGenerator] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null); // Currently studying day
  const [isStudying, setIsStudying] = useState(false); // Study mode
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [studyNotes, setStudyNotes] = useState(''); // Notes for studying
  const [showNotes, setShowNotes] = useState(false);

  // Debounce topic search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTopic(topicSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [topicSearch]);

  // Load progress, plans, and notes from localStorage on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem('learningPlanProgress');
    const savedPlans = localStorage.getItem('allLearningPlans');
    const savedNotes = localStorage.getItem('studyNotes');
    
    if (savedProgress) {
      try {
        setPlanProgress(JSON.parse(savedProgress));
      } catch (e) {
        console.error('Failed to load progress:', e);
      }
    }
    
    if (savedPlans) {
      try {
        const plans = JSON.parse(savedPlans);
        setAllPlans(plans);
        // Set the most recent plan as active
        if (plans.length > 0) {
          setGeneratedPlan(plans[plans.length - 1]);
        }
      } catch (e) {
        console.error('Failed to load plans:', e);
      }
    }
    
    if (savedNotes) {
      try {
        setStudyNotes(savedNotes);
      } catch (e) {
        console.error('Failed to load notes:', e);
      }
    }
  }, []);

  // Save progress to localStorage whenever it changes
  useEffect(() => {
    if (Object.keys(planProgress).length > 0) {
      localStorage.setItem('learningPlanProgress', JSON.stringify(planProgress));
    }
  }, [planProgress]);

  // Save all plans to localStorage whenever it changes
  useEffect(() => {
    if (allPlans.length > 0) {
      localStorage.setItem('allLearningPlans', JSON.stringify(allPlans));
    }
  }, [allPlans]);

  // Save study notes to localStorage
  useEffect(() => {
    if (studyNotes) {
      localStorage.setItem('studyNotes', studyNotes);
    }
  }, [studyNotes]);

  // Filter catalog by query
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return CATALOG;
    return CATALOG.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.summary.toLowerCase().includes(q) ||
        x.type.toLowerCase().includes(q)
    );
  }, [query]);

  // Assign selected item to a specific day
  const addToDay = (dayNum) => {
    if (!selected) return;
    setDays((prev) =>
      prev.map((d) =>
        d.day === dayNum
          ? {
              ...d,
              items: d.items.find((it) => it.id === selected.id)
                ? d.items // avoid duplicates
                : [...d.items, selected],
            }
          : d
      )
    );
  };

  const removeFromDay = (dayNum, itemId) => {
    setDays((prev) =>
      prev.map((d) =>
        d.day === dayNum ? { ...d, items: d.items.filter((it) => it.id !== itemId) } : d
      )
    );
  };

  const changeDaysCount = (n) => {
    const count = Number(n) || 7;
    const next = makeDays(count);
    // keep existing assignments up to new count
    for (let i = 0; i < Math.min(count, days.length); i++) next[i] = days[i];
    setDays(next);
  };

  // Generate learning plan based on user preferences
  const generateLearningPlan = () => {
    if (!debouncedTopic.trim()) {
      alert('Please enter a topic to learn');
      return;
    }

    const topic = debouncedTopic.trim();
    const plan = [];
    
    // Generate day-wise plan based on duration, skill level, and learning type
    const baseTopics = getTopicsForSkillLevel(skillLevel, learningType, topic);
    const topicsPerDay = Math.max(1, Math.ceil(baseTopics.length / duration));

    for (let i = 0; i < duration; i++) {
      const dayIndex = Math.floor((i / duration) * baseTopics.length);
      const dayTopics = baseTopics.slice(dayIndex, Math.min(dayIndex + topicsPerDay, baseTopics.length));
      
      plan.push({
        day: i + 1,
        title: dayTopics[0]?.title || `${topic} - Day ${i + 1}`,
        topics: dayTopics,
        tasks: generateTasksForDay(i + 1, topic, skillLevel, learningType, duration),
        completed: planProgress[`day-${i + 1}`] || false,
        notes: '',
      });
    }

    const newPlan = {
      id: Date.now().toString(),
      topic,
      duration,
      skillLevel,
      learningType,
      days: plan,
      createdAt: new Date().toISOString(),
    };

    // Add to all plans
    setAllPlans((prev) => [...prev, newPlan]);
    setGeneratedPlan(newPlan);

    // Update progress tracking for new plan
    const newProgress = {};
    plan.forEach((day) => {
      newProgress[`day-${day.day}`] = planProgress[`day-${day.day}`] || false;
    });
    setPlanProgress(newProgress);
  };

  // Load a plan for studying
  const loadPlanForStudy = (plan) => {
    setGeneratedPlan(plan);
    setIsStudying(false);
    setSelectedDay(null);
    setSidebarCollapsed(false);
  };

  // Start studying a specific day
  const startStudyingDay = (day) => {
    setSelectedDay(day);
    setIsStudying(true);
    setSidebarCollapsed(true);
    // Load notes for this day if available
    const dayNotes = day.notes || '';
    setStudyNotes(dayNotes);
  };

  // Save notes for current day
  const saveDayNotes = () => {
    if (!generatedPlan || !selectedDay) return;
    
    const updatedPlan = {
      ...generatedPlan,
      days: generatedPlan.days.map((d) =>
        d.day === selectedDay.day ? { ...d, notes: studyNotes } : d
      ),
    };
    
    setGeneratedPlan(updatedPlan);
    setSelectedDay({ ...selectedDay, notes: studyNotes }); // Update selected day with notes
    setAllPlans((prev) =>
      prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    );
    
    // Show success feedback
    alert('Notes saved successfully!');
  };

  // Get topics based on skill level and learning type
  const getTopicsForSkillLevel = (level, type, topic) => {
    const baseTopics = {
      Beginner: [
        { title: `Introduction to ${topic}`, description: 'Basic concepts and fundamentals' },
        { title: `${topic} Basics`, description: 'Core principles and terminology' },
        { title: `Getting Started with ${topic}`, description: 'Setup and first steps' },
        { title: `${topic} Fundamentals`, description: 'Essential building blocks' },
        { title: `Practice with ${topic}`, description: 'Hands-on exercises' },
      ],
      Intermediate: [
        { title: `Advanced ${topic} Concepts`, description: 'Diving deeper into core concepts' },
        { title: `${topic} Best Practices`, description: 'Industry standards and patterns' },
        { title: `Building with ${topic}`, description: 'Practical implementation' },
        { title: `${topic} Patterns and Architecture`, description: 'Design patterns' },
        { title: `Optimizing ${topic}`, description: 'Performance and efficiency' },
      ],
      Experienced: [
        { title: `Mastering ${topic}`, description: 'Advanced techniques and strategies' },
        { title: `${topic} at Scale`, description: 'Enterprise-level considerations' },
        { title: `Advanced ${topic} Patterns`, description: 'Complex architectural patterns' },
        { title: `${topic} Optimization`, description: 'Performance tuning and best practices' },
        { title: `${topic} Innovations`, description: 'Cutting-edge features and trends' },
      ],
    };

    let topics = baseTopics[level] || baseTopics.Intermediate;
    
    // Adjust based on learning type
    if (type === 'Theory Focused') {
      topics = topics.map(t => ({ ...t, description: t.description + ' (Theory)' }));
    } else if (type === 'Hands-on Projects') {
      topics = topics.map(t => ({ ...t, description: t.description + ' (Project-based)' }));
    } else if (type === 'Quick Revision') {
      topics = topics.slice(0, Math.ceil(topics.length * 0.6));
    }

    return topics;
  };

  // Generate tasks for a specific day
  const generateTasksForDay = (dayNum, topic, skillLevel, learningType, totalDays) => {
    const tasks = [];
    
    const taskTemplates = {
      Beginner: [
        `Read introduction to ${topic}`,
        `Watch tutorial on ${topic} basics`,
        `Complete ${topic} setup`,
        `Practice basic ${topic} exercises`,
      ],
      Intermediate: [
        `Study advanced ${topic} concepts`,
        `Solve ${topic} problems`,
        `Implement ${topic} features`,
        `Review ${topic} documentation`,
      ],
      Experienced: [
        `Research advanced ${topic} techniques`,
        `Build complex ${topic} system`,
        `Optimize ${topic} performance`,
        `Contribute to ${topic} community`,
      ],
    };

    let baseTasks = taskTemplates[skillLevel] || taskTemplates.Intermediate;
    
    // Adjust tasks based on learning type
    if (learningType === 'Theory Focused') {
      baseTasks = baseTasks.filter(t => t.includes('Read') || t.includes('Study') || t.includes('Review'));
      baseTasks.push(`Research ${topic} concepts`);
      baseTasks.push(`Take notes on ${topic} theory`);
    } else if (learningType === 'Hands-on Projects') {
      baseTasks = baseTasks.filter(t => t.includes('Practice') || t.includes('Build') || t.includes('Implement'));
      baseTasks.push(`Create ${topic} project`);
      baseTasks.push(`Deploy ${topic} application`);
    }

    // Select tasks based on detail type (implicit from learning type)
    const taskCount = learningType === 'Quick Revision' ? 2 : 3;
    for (let i = 0; i < taskCount; i++) {
      tasks.push(baseTasks[i % baseTasks.length]);
    }

    return tasks;
  };

  // Toggle day completion
  const toggleDayCompletion = (dayNum) => {
    setPlanProgress((prev) => {
      const newProgress = {
        ...prev,
        [`day-${dayNum}`]: !prev[`day-${dayNum}`],
      };
      return newProgress;
    });
    
    // Update generated plan
    if (generatedPlan) {
      setGeneratedPlan((prev) => ({
        ...prev,
        days: prev.days.map((d) =>
          d.day === dayNum ? { ...d, completed: !d.completed } : d
        ),
      }));
    }
  };

  // Calculate progress percentage
  const progressPercentage = generatedPlan
    ? (generatedPlan.days.filter((d) => planProgress[`day-${d.day}`]).length / generatedPlan.days.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      {/* Top bar */}
      <div className="max-w-[1920px] mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded bg-indigo-600" />
          <span className="text-lg font-semibold">Create Plan</span>
        </div>
        <div className="flex items-center gap-3">
          {/* Notes Button */}
          <button
            onClick={() => {
              setShowNotes(!showNotes);
              if (!showNotes && isStudying && selectedDay) {
                setStudyNotes(selectedDay.notes || '');
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showNotes
                ? 'bg-indigo-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            📝 Make Notes
          </button>
          {!isStudying && (
            <>
              <label className="text-sm text-gray-300">Days</label>
              <select
                className="bg-gray-800 border border-white/10 rounded px-2 py-1"
                value={days.length}
                onChange={(e) => changeDaysCount(e.target.value)}
              >
                {[7, 10, 15, 21].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>

      {/* Notes Panel */}
      {showNotes && (
        <div className="max-w-[1920px] mx-auto px-4 md:px-6 pb-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                {isStudying && selectedDay
                  ? `Notes for Day ${selectedDay.day}: ${selectedDay.title}`
                  : 'Study Notes'}
              </h3>
              <div className="flex gap-2">
                {isStudying && selectedDay && (
                  <button
                    onClick={saveDayNotes}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg"
                  >
                    Save Notes
                  </button>
                )}
                <button
                  onClick={() => setShowNotes(false)}
                  className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-sm rounded-lg"
                >
                  Close
                </button>
              </div>
            </div>
            <textarea
              value={studyNotes}
              onChange={(e) => setStudyNotes(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full bg-gray-800 border border-white/10 rounded px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-indigo-500 min-h-[150px]"
              rows={6}
            />
          </div>
        </div>
      )}

      {/* Learning Plan Generator Section */}
      <div className="max-w-6xl mx-auto px-4 md:px-6 pb-6">
        <div className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Generate Personalized Learning Plan</h2>
            <button
              onClick={() => setShowPlanGenerator(!showPlanGenerator)}
              className="text-sm text-indigo-400 hover:text-indigo-300"
            >
              {showPlanGenerator ? 'Hide' : 'Show'}
            </button>
          </div>
          
          {showPlanGenerator && (
            <div className="space-y-4">
              {/* Topic Search */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  What do you want to learn? <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={topicSearch}
                  onChange={(e) => setTopicSearch(e.target.value)}
                  placeholder="e.g., React, Machine Learning, Python..."
                  className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                {debouncedTopic && (
                  <p className="mt-1 text-xs text-gray-400">
                    Searching for: <span className="text-indigo-400">{debouncedTopic}</span>
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Duration Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <select
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={3}>3 days</option>
                    <option value={7}>7 days (1 week)</option>
                    <option value={15}>15 days (2 weeks)</option>
                    <option value={30}>30 days (1 month)</option>
                  </select>
                </div>

                {/* Skill Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Skill Level
                  </label>
                  <select
                    value={skillLevel}
                    onChange={(e) => setSkillLevel(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Experienced">Experienced</option>
                  </select>
                </div>

                {/* Learning Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Learning Type
                  </label>
                  <select
                    value={learningType}
                    onChange={(e) => setLearningType(e.target.value)}
                    className="w-full bg-gray-800 border border-white/10 rounded px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Theory Focused">Theory Focused</option>
                    <option value="Hands-on Projects">Hands-on Projects</option>
                    <option value="Mixed">Mixed</option>
                    <option value="Quick Revision">Quick Revision</option>
                  </select>
                </div>
              </div>

              {/* Generate Button */}
              <button
                onClick={generateLearningPlan}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate Learning Plan
              </button>

              {/* Generated Plan Info */}
              {generatedPlan && (
                <div className="mt-4 p-4 bg-indigo-600/10 border border-indigo-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-indigo-300">Generated Plan: {generatedPlan.topic}</h3>
                    <div className="text-sm text-gray-400">
                      {generatedPlan.days.filter((d) => planProgress[`day-${d.day}`]).length}/{generatedPlan.days.length} days complete
                    </div>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2 mt-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                    <span>Skill: {generatedPlan.skillLevel}</span>
                    <span>•</span>
                    <span>Type: {generatedPlan.learningType}</span>
                    <span>•</span>
                    <span>Duration: {generatedPlan.duration} days</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className={`max-w-[1920px] mx-auto px-4 md:px-6 pb-12 flex gap-6 transition-all duration-300 ${
        sidebarCollapsed ? 'grid-cols-1' : 'grid-cols-[280px_minmax(0,1fr)]'
      }`}>
        {/* Left: Previous Plans */}
        <aside
          className={`bg-white/5 border border-white/10 rounded-xl p-4 transition-all duration-300 ${
            sidebarCollapsed ? 'hidden md:block md:w-16 overflow-hidden' : 'w-full md:w-80'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-semibold ${sidebarCollapsed ? 'hidden' : ''}`}>Previous Plans</h3>
            {isStudying && (
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="text-gray-400 hover:text-white p-1"
                title={sidebarCollapsed ? 'Expand' : 'Collapse'}
              >
                {sidebarCollapsed ? '→' : '←'}
              </button>
            )}
          </div>
          
          {!sidebarCollapsed && (
            <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
              {allPlans.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-4">
                  No plans yet. Create your first plan!
                </div>
              ) : (
                allPlans
                  .slice()
                  .reverse()
                  .map((plan) => (
                    <div
                      key={plan.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        generatedPlan?.id === plan.id
                          ? 'bg-indigo-600/20 border-indigo-500'
                          : 'bg-gray-800/60 border-white/10 hover:bg-gray-700/60'
                      }`}
                      onClick={() => loadPlanForStudy(plan)}
                    >
                      <div className="text-sm font-medium truncate">{plan.topic}</div>
                      <div className="text-xs text-gray-400 mt-1">
                        {plan.duration} days • {plan.skillLevel}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(plan.createdAt).toLocaleDateString()}
                      </div>
                      <div className="mt-2 text-xs text-gray-400">
                        {plan.days.filter((d) => planProgress[`day-${d.day}`]).length}/
                        {plan.days.length} completed
                      </div>
                    </div>
                  ))
              )}
            </div>
          )}
        </aside>

        {/* Center: Study Content - Much Bigger */}
        <section
          className={`bg-white/5 border border-white/10 rounded-xl p-6 transition-all duration-300 ${
            isStudying
              ? 'flex-1 min-h-[calc(100vh-250px)]'
              : 'flex-1'
          }`}
        >
          {isStudying && selectedDay ? (
            <div className="h-full flex flex-col">
              <div className="flex items-start justify-between mb-4 pb-4 border-b border-white/10">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm text-indigo-400">Day {selectedDay.day}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-400">
                      {planProgress[`day-${selectedDay.day}`] ? '✓ Completed' : 'In Progress'}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mb-2">{selectedDay.title}</h2>
                  {selectedDay.topics && selectedDay.topics.length > 0 && (
                    <div className="text-sm text-gray-400">
                      {selectedDay.topics.map((t, i) => (
                        <span key={i}>{t.description || t.title}{i < selectedDay.topics.length - 1 ? ' • ' : ''}</span>
                      ))}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => {
                    setIsStudying(false);
                    setSelectedDay(null);
                    setSidebarCollapsed(false);
                  }}
                  className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-sm"
                >
                  Exit Study
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Tasks for Today</h3>
                  <ul className="space-y-3">
                    {selectedDay.tasks.map((task, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-3 p-3 bg-gray-800/50 rounded-lg border border-white/10"
                      >
                        <div className="mt-1 w-6 h-6 rounded-full border-2 border-indigo-500 flex items-center justify-center shrink-0">
                          <span className="text-xs text-indigo-400">{idx + 1}</span>
                        </div>
                        <span className="text-gray-200 flex-1">{task}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {selectedDay.notes && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3">Your Notes</h3>
                    <div className="p-4 bg-gray-800/50 rounded-lg border border-white/10 whitespace-pre-wrap text-gray-200">
                      {selectedDay.notes || 'No notes yet. Click "Make Notes" to add notes.'}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : generatedPlan ? (
            <div className="h-full">
              <div className="mb-4 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-bold mb-2">{generatedPlan.topic}</h2>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{generatedPlan.duration} days</span>
                  <span>•</span>
                  <span>{generatedPlan.skillLevel}</span>
                  <span>•</span>
                  <span>{generatedPlan.learningType}</span>
                </div>
              </div>
              <div className="text-center py-12 text-gray-400">
                <p className="mb-4">Select a day from the right sidebar to start studying</p>
                <p className="text-sm">Or generate a new plan above</p>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] grid place-items-center text-gray-400">
              <div className="text-center">
                <p className="mb-2">No active plan</p>
                <p className="text-sm">Create a new learning plan to get started</p>
              </div>
            </div>
          )}
        </section>

        {/* Right: Day-wise plan */}
        {!isStudying && (
          <aside className="w-full md:w-80 bg-white/5 border border-white/10 rounded-xl p-4">
            <h3 className="font-semibold mb-3">
              {generatedPlan ? 'Learning Plan Days' : 'Day-wise plan'}
            </h3>
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto pr-1">
              {/* Show generated plan if available, otherwise show manual plan */}
              {generatedPlan ? (
                generatedPlan.days.map((day) => (
                  <div
                    key={day.day}
                    className={`rounded-lg border p-3 cursor-pointer transition-all ${
                      selectedDay?.day === day.day
                        ? 'bg-indigo-600/30 border-indigo-500 ring-2 ring-indigo-500/50'
                        : planProgress[`day-${day.day}`]
                        ? 'bg-indigo-600/20 border-indigo-500/50'
                        : 'bg-gray-800/60 border-white/10'
                    } hover:bg-gray-700/60`}
                    onClick={() => startStudyingDay(day)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 flex-1">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${
                            planProgress[`day-${day.day}`]
                              ? 'bg-indigo-600 border-indigo-600'
                              : 'border-gray-600'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDayCompletion(day.day);
                          }}
                        >
                          {planProgress[`day-${day.day}`] && (
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">Day {day.day}</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-gray-200 mb-2 ml-7">{day.title}</div>
                    <ul className="space-y-1 ml-7 mb-2">
                      {day.tasks.slice(0, 2).map((task, idx) => (
                        <li key={idx} className="text-xs text-gray-400">
                          • {task}
                        </li>
                      ))}
                      {day.tasks.length > 2 && (
                        <li className="text-xs text-gray-500 italic">
                          +{day.tasks.length - 2} more tasks
                        </li>
                      )}
                    </ul>
                    <div className="ml-7 flex items-center justify-between">
                      {planProgress[`day-${day.day}`] && (
                        <div className="text-xs text-indigo-400">✓ Completed</div>
                      )}
                      <button
                        onClick={() => startStudyingDay(day)}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                      >
                        Start Study →
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                days.map((d) => (
                  <div key={d.day} className="rounded-lg border border-white/10 bg-gray-800/60">
                    <div className="px-3 py-2 flex items-center justify-between">
                      <span className="text-sm font-medium">Day {d.day}</span>
                      <span className="text-xs text-gray-400">{d.items.length} item(s)</span>
                    </div>
                    <div className="px-3 pb-3 space-y-2">
                      {d.items.length === 0 && (
                        <div className="text-xs text-gray-500 italic">No items assigned.</div>
                      )}
                      {d.items.map((it) => (
                        <div
                          key={it.id}
                          className="text-xs flex items-start justify-between gap-2 rounded bg-gray-900/60 border border-white/10 px-2 py-2"
                        >
                          <div>
                            <div className="font-medium">{it.title}</div>
                            <div className="text-gray-400 capitalize">{it.type}</div>
                          </div>
                          <button
                            onClick={() => removeFromDay(d.day, it.id)}
                            className="shrink-0 text-red-300 hover:text-red-200"
                            title="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

export default CreatePlan;
