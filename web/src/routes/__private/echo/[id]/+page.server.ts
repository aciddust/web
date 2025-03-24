import { SUPABASE_URL, SUPABASE_PASSWORD } from '$env/static/private';

export const load = async ({ params }) => {
  return {
    props: {
      id: params.id,
      supabaseUrl: SUPABASE_URL,
      supabasePassword: SUPABASE_PASSWORD,
    },
  };
}