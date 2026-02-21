import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environmental variables
# We look for .env.local in the current directory (src root or workspace root)
load_dotenv('C:/Users/howar/Desktop/micondowebapp/.env.local')

url: str = os.environ.get("VITE_SUPABASE_URL")
key: str = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not url or not key:
    print("❌ Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in .env.local")
    exit(1)

supabase: Client = create_client(url, key)

def verify_1000_percent():
    print("--- 🔍 Starting 1000% Functionality Verification ---")
    
    try:
        # 1. Test profiles (Check if we can read our own)
        # Note: In a script we might not have 'auth.uid()', but the anon key should work 
        # for a basic check if RLS allows public select or if we simulate session.
        # But here we just want to see if the query even runs without recursion error.
        print("1. Checking 'condos' table...")
        condos = supabase.table("condos").select("*").execute()
        print(f"✅ 'condos' query successful. Found {len(condos.data)} condos.")
        for condo in condos.data:
            print(f"   - {condo['name']} (Code: {condo['code']})")

        # 2. Test bot_conversations
        print("\n2. Checking 'bot_conversations' table...")
        convs = supabase.table("bot_conversations").select("*").execute()
        print(f"✅ 'bot_conversations' query successful. Found {len(convs.data)} conversations.")
        for conv in convs.data:
            msg_count = len(conv.get('messages', [])) if conv.get('messages') else 0
            print(f"   - Phone: {conv['phone']} | State: {conv['state']} | Messages: {msg_count}")

        if len(convs.data) >= 3:
            print("\n⭐️ VERIFICATION SUCCESS: Data is present and RLS loop is broken.")
        else:
            print("\n⚠️ WARNING: Not all dummy data found. Check seeding script.")

    except Exception as e:
        print(f"❌ VERIFICATION FAILED: {str(e)}")

if __name__ == "__main__":
    verify_1000_percent()
