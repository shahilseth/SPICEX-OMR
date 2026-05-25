import { supabase } from '../db/supabaseClient';

export interface CreateSupplierInput {
  name: string;
  location?: string;
}

export async function createSupplier(input: CreateSupplierInput) {
  if (!input.name || input.name.trim() === '') {
    throw new Error('Supplier name is required');
  }

  // Check for duplicate supplier
  const { data: existing, error: checkError } = await supabase
    .from('suppliers')
    .select('id')
    .eq('name', input.name)
    .limit(1);

  if (checkError) {
    throw new Error(checkError.message);
  }

  if (existing && existing.length > 0) {
    throw new Error('Supplier already exists');
  }

  // Insert supplier
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      name: input.name,
      location: input.location ?? null
    })
    .select()
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}