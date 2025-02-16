export interface PostFromGithub {
  name: string;
  category: string;
  postId: string; // if null, ignore
  date: Date | null;
  path: string;
  sha: string;
  url: string;
  download_url: string;
  type: string;
}

export interface ContentByPostIdFromGithub {
  path: string;
  sha: string;
  download_url: string | null;
}

export interface PostList {
  total: number;
  posts: PostFromGithub[];
}

export interface PostListByCategory {
  [key: string]: PostList;
}

export interface PostById {
  [key: number]: PostFromGithub;
}
