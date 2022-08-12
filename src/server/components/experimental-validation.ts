// -------------------------------------------------------------------------- //
// Internal
// -------------------------------------------------------------------------- //
import { cache } from '../cache';
import {
  ExperimentalValidation,
  ExperimentalValidationCollection,
} from '../models';

// -------------------------------------------------------------------------- //
// Functions
// -------------------------------------------------------------------------- //

export async function getExperimentalValidation(ensg: string) {
  const cacheKey = 'experimental-validation-' + ensg;
  let result: ExperimentalValidation[] | undefined = cache.get(cacheKey);

  if (result) {
    return result;
  }

  result = await ExperimentalValidationCollection.find({
    ensembl_gene_id: ensg,
  })
    .lean()
    .exec();

  cache.set(cacheKey, result);
  return result;
}
