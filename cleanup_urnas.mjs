#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jiijyzskatbeeafoscoy.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseKey) {
  console.error('VITE_SUPABASE_ANON_KEY not set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanupUrnas() {
  try {
    // Get all urnas
    const { data: urnas, error: selectError } = await supabase
      .from('urnas')
      .select('id, status');

    if (selectError) {
      console.error('Error reading urnas:', selectError);
      return;
    }

    console.log('Current urnas:', urnas);

    if (urnas && urnas.length > 0) {
      // Delete all urnas except the first one
      const idsToDelete = urnas.slice(1).map(u => u.id);
      
      if (idsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('urnas')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error('Error deleting urnas:', deleteError);
        } else {
          console.log(`Deleted ${idsToDelete.length} urnas`);
        }
      }

      // Keep the first urna and reset it to aguardando
      const keepUrnaId = urnas[0].id;
      const { error: updateError } = await supabase
        .from('urnas')
        .update({ student_matricula_ativa: null, status: 'aguardando' })
        .eq('id', keepUrnaId);

      if (updateError) {
        console.error('Error resetting urna:', updateError);
      } else {
        console.log(`Reset urna ${keepUrnaId} to aguardando`);
      }

      // Also reset all students to cinza (pendente)
      const { error: resetStudentsError } = await supabase
        .from('students')
        .update({ status_voto: 'cinza' })
        .neq('status_voto', 'vermelho');

      if (resetStudentsError) {
        console.error('Error resetting students:', resetStudentsError);
      } else {
        console.log('Reset all students to cinza');
      }

      console.log('\n✅ Cleanup complete');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

cleanupUrnas();
