export const defaultDailyQuestions = [
  {
    id: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    link: "https://leetcode.com/problems/two-sum/",
  },
  {
    id: "group-anagrams",
    title: "Group Anagrams",
    difficulty: "Medium",
    link: "https://leetcode.com/problems/group-anagrams/",
  },
  {
    id: "merge-k-sorted-lists",
    title: "Merge k Sorted Lists",
    difficulty: "Hard",
    link: "https://leetcode.com/problems/merge-k-sorted-lists/",
  },
];

export const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getDateKey(date = new Date()) {
  return date.toISOString().split("T")[0];
}

export function readableDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const dsa45DayPlan = [
  ["Two Sum", "Contains Duplicate", "Buy & Sell Stock"],
  ["Valid Anagram", "Group Anagrams", "Top K Frequent"],
  ["Product Except Self", "Encode/Decode Strings", "Longest Consecutive"],
  ["Valid Palindrome", "Two Sum II", "3Sum"],
  ["Container With Most Water", "Trapping Rain Water", "Two Pointers Revision"],
  ["Re-solve: Two Sum", "Re-solve: 3Sum", "Re-solve: Trapping Rain Water"],
  ["Buy & Sell Stock", "Longest No Repeat", "Longest Repeating Char Repl."],
  ["Permutation in String", "Min Window Substring", "Sliding Window Max"],
  ["Range Sum Query", "Insert Interval", "Merge Intervals"],
  ["Non-overlap Intervals", "Meeting Rooms II", "Min Interval Each Query"],
  ["Valid Parentheses", "Min Stack", "Eval Reverse Polish"],
  ["Generate Parentheses", "Daily Temperatures", "Car Fleet"],
  ["Re-solve Sliding Window", "Re-solve Stack", "No Hints Revision"],
  ["Binary Search", "Search 2D Matrix", "Koko Eating Bananas"],
  ["Find Min Rotated", "Search Rotated Array", "Time-Based Key-Val"],
  ["Reverse Linked List", "Merge Two Sorted Lists", "Reorder List"],
  ["Remove Nth Node", "Copy List w/ Random", "Add Two Numbers"],
  ["Linked List Cycle", "Find Duplicate Number", "LRU Cache"],
  ["Merge K Sorted Lists", "Reverse Nodes in K-Group", "Linked List Advanced"],
  ["Timed: Binary Search", "Timed: LRU Cache", "Revision Grade Check"],
  ["Longest Palindromic Substr.", "Palindromic Substrings", "Find All Anagrams"],
  ["Num of 1 Bits", "Counting Bits", "Reverse Bits"],
  ["Invert Binary Tree", "Max Depth of BT", "Diameter of BT"],
  ["Same Tree", "Subtree of Another Tree", "LCA of Binary Tree"],
  ["BT Level Order", "BT Right Side View", "Count Good Nodes in BT"],
  ["Validate BST", "Kth Smallest in BST", "Construct BT Pre+Inorder"],
  ["BT Max Path Sum", "Serialize/Deserialize BT", "Word Search II"],
  ["Implement Trie", "Design Add and Search Words", "Trie Revision"],
  ["Whiteboard BT Level Order", "Whiteboard LCA", "No IDE Revision"],
  ["Kth Largest in Stream", "Last Stone Weight", "K Closest Points"],
  ["Number of Islands", "Clone Graph", "Max Area of Island"],
  ["Pacific Atlantic Flow", "Surrounded Regions", "Rotting Oranges"],
  ["Walls and Gates", "Course Schedule", "Course Schedule II"],
  ["Redundant Connection", "Connected Components", "Network Delay Time"],
  ["Master Islands BFS+DFS", "Master Course Schedule", "Graph Revision"],
  ["Subsets", "Combination Sum", "Permutations"],
  ["Subsets II", "Combination Sum II", "Word Search"],
  ["Palindrome Partitioning", "Letter Combos Phone", "N-Queens"],
  ["Climbing Stairs", "Min Cost Climbing Stairs", "House Robber"],
  ["Longest Palindromic Substr.", "Palindromic Substrings", "Decode Ways"],
  ["Max Product Subarray", "Word Break", "Longest Increasing Subseq."],
  ["House Robber Pattern", "Coin Change Pattern", "DP Pattern Revision"],
  ["Unique Paths", "Longest Common Subsequence", "Buy+Sell+Cooldown"],
  ["Coin Change II", "Target Sum", "Interleaving String"],
  ["Maximum Subarray", "Min Window Substr.", "Course Schedule Mock"],
];

export function build45DaySchedule(startDateKey = getDateKey()) {
  const start = new Date(`${startDateKey}T00:00:00`);
  return dsa45DayPlan.reduce((acc, tasks, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const dateKey = date.toISOString().split("T")[0];
    acc[dateKey] = {
      q1Title: tasks[0] || "",
      q1Link: "",
      q2Title: tasks[1] || "",
      q2Link: "",
      q3Title: tasks[2] || "",
      q3Link: "",
    };
    return acc;
  }, {});
}
