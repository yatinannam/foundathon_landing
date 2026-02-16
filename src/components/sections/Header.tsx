import { cookies } from "next/headers";
import { EVENT_ID } from "@/lib/register-api";
import { createClient } from "@/utils/supabase/server";
import HeaderClient from "./HeaderClient";

type HeaderState = {
  isSignedIn: boolean;
  teamId: string | null;
};

const getHeaderState = async (): Promise<HeaderState> => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return { isSignedIn: false, teamId: null };
  }

  const cookieStore = cookies();
  const supabase = await createClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { isSignedIn: false, teamId: null };
  }

  const { data: team } = await supabase
    .from("eventsregistrations")
    .select("id")
    .eq("event_id", EVENT_ID)
    .eq("application_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return {
    isSignedIn: true,
    teamId: team?.id ?? null,
  };
};

const Header = async () => {
  const { isSignedIn, teamId } = await getHeaderState();
  return <HeaderClient initialIsSignedIn={isSignedIn} initialTeamId={teamId} />;
};

export default Header;
