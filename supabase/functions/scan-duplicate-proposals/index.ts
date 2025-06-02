
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Query to find duplicate proposals based on CNPJ + total_debt
    const { data, error } = await supabaseClient
      .from('proposals')
      .select('cnpj, total_debt, created_at')
      .not('cnpj', 'is', null)
      .not('total_debt', 'is', null)

    if (error) {
      throw error
    }

    // Group by CNPJ + total_debt and find duplicates
    const grouped = data.reduce((acc: any, proposal: any) => {
      const key = `${proposal.cnpj}-${proposal.total_debt}`
      if (!acc[key]) {
        acc[key] = []
      }
      acc[key].push(proposal)
      return acc
    }, {})

    // Find groups with more than 1 proposal
    const duplicateGroups = Object.entries(grouped)
      .filter(([_, proposals]: [string, any]) => proposals.length > 1)
      .map(([key, proposals]: [string, any]) => {
        const [cnpj, total_debt] = key.split('-')
        const sortedProposals = proposals.sort((a: any, b: any) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        return {
          cnpj,
          total_debt: parseFloat(total_debt),
          count: proposals.length,
          latest_created_at: sortedProposals[0].created_at
        }
      })

    return new Response(
      JSON.stringify(duplicateGroups),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )

  } catch (error) {
    console.error('Error scanning duplicates:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        }
      }
    )
  }
})
