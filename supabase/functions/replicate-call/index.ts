// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Replicate from "npm:replicate@1.0.1";
import { createClient } from "npm:@supabase/supabase-js@2.53.0";

const supabase = createClient(
  	Deno.env.get("SUPABASE_URL") || "",
  	Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",	
);

const replicateApiKey = Deno.env.get("REPLICATE_API_KEY");
const model = "andreasjansson/blip-2:f677695e5e89f8b236e52ecd1d3f01beb44c34606419bcc19345e046d8f786f9";

const replicate = new Replicate({
  	auth: replicateApiKey 
});

Deno.serve(async (req) => {
	const { image, question } = await req.json();
	
	const { data } = supabase.storage.from('quest-upload').getPublicUrl(image);
	
	const input = { image: data.publicUrl, question };
	const replicateOutput = await replicate.run(model, { input });

	console.log(data.publicUrl, question)
	console.log(replicateOutput);

	return new Response(JSON.stringify(replicateOutput), {
		headers: { "Content-Type": "application/json" },
	});
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/replicate-call' \
	--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
	--header 'Content-Type: application/json' \
	--data '{"name":"Functions"}'

*/
