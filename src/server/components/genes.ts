// -------------------------------------------------------------------------- //
// External
// -------------------------------------------------------------------------- //
import { Request, Response, NextFunction } from 'express';

// -------------------------------------------------------------------------- //
// Internal
// -------------------------------------------------------------------------- //
import { setHeaders, cache, altCache } from '../helpers';
import { Gene, GeneCollection } from '../models';
import {
  getRnaDifferentialExpression,
  getProteomicsLFQ,
  getProteomicsTMT,
  getMetabolomics,
  getExperimentalValidation,
  getNeuropathologicCorrelations,
  getOverallScores,
  getGeneLinks,
} from '.';

// -------------------------------------------------------------------------- //
// Functions
// -------------------------------------------------------------------------- //
export async function getAllGenes() {
  const cacheKey = 'genes';
  let result: Gene[] | undefined = altCache.get(cacheKey);

  if (result) {
    return result;
  }

  result = await GeneCollection.find()
    .lean()
    .sort({ hgnc_symbol: 1, ensembl_gene_id: 1 })
    .exec();

  altCache.set(cacheKey, result);
  return result;
}

export async function getGenes(ids?: string | string[]) {
  const genes: Gene[] = await getAllGenes();

  if (ids) {
    ids = typeof ids == 'string' ? ids.split(',') : ids;
    return genes.filter((g: Gene) => ids?.includes(g.ensembl_gene_id));
  }

  return genes;
}

export async function getGenesMap() {
  const genes = await getGenes();
  return new Map(genes.map((g: Gene) => [g.ensembl_gene_id, g]));
}

export async function getGene(ensg: string) {
  ensg = ensg.trim();
  const cacheKey = ensg + '-gene';
  let result: Gene | null | undefined = cache.get(cacheKey);

  if (result) {
    return result;
  }

  result = await GeneCollection.findOne({
    ensembl_gene_id: ensg,
  })
    .lean()
    .exec();

  if (result) {
    result.rna_differential_expression = await getRnaDifferentialExpression(
      ensg
    );
    result.proteomics_LFQ = await getProteomicsLFQ(ensg);
    result.proteomics_TMT = await getProteomicsTMT(ensg);
    result.metabolomics = await getMetabolomics(ensg);
    result.neuropathologic_correlations = await getNeuropathologicCorrelations(
      ensg
    );
    result.overall_scores = await getOverallScores(ensg);
    result.experimental_validation = await getExperimentalValidation(ensg);
    result.links = await getGeneLinks(ensg);
  }

  cache.set(cacheKey, result);
  return result;
}

export async function searchGene(id: string) {
  id = id.trim();
  const isEnsembl = id.startsWith('ENSG');
  let query: { [key: string]: any } | null = null;

  if (isEnsembl) {
    if (id.length == 15) {
      query = { ensembl_gene_id: id };
    } else {
      query = { ensembl_gene_id: { $regex: id, $options: 'i' } };
    }
  } else {
    query = {
      $or: [
        {
          hgnc_symbol: { $regex: id, $options: 'i' },
        },
        {
          alias: new RegExp('^' + id + '$', 'i'),
        },
      ],
    };
  }

  const result = await GeneCollection.find(query).lean().exec();

  return result;
}

export async function getNominatedGenes() {
  const cacheKey = 'nominated-genes';
  let result: Gene[] | undefined = cache.get(cacheKey);

  if (result) {
    return result;
  }

  result = await GeneCollection.find({ nominations: { $gt: 0 } })
    .select(
      [
        'hgnc_symbol',
        'ensembl_gene_id',
        'nominations',
        'nominatedtarget.initial_nomination',
        'nominatedtarget.team',
        'nominatedtarget.study',
        'nominatedtarget.source',
        'nominatedtarget.input_data',
        'nominatedtarget.validation_study_details',
        'druggability.pharos_class',
        'druggability.sm_druggability_bucket',
        'druggability.classification',
        'druggability.safety_bucket',
        'druggability.safety_bucket_definition',
        'druggability.abability_bucket',
        'druggability.abability_bucket_definition',
      ].join(' ')
    )
    .lean()
    .sort({ nominations: -1, hgnc_symbol: 1 })
    .exec();

  cache.set(cacheKey, result);
  return result;
}

// -------------------------------------------------------------------------- //
// Routes
// -------------------------------------------------------------------------- //
export async function genesRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.query || !req.query.ids) {
    res.status(404).send('Not found');
    return;
  }

  try {
    const result = await getGenes(<string | string[]>req.query.ids);
    setHeaders(res);
    res.json({ items: result });
  } catch (err) {
    next(err);
  }
}

export async function geneRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.params || !req.params.id) {
    res.status(404).send('Not found');
    return;
  }

  try {
    const result = await getGene(<string>req.params.id);
    setHeaders(res);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function searchGeneRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.query || !req.query.id) {
    res.status(404).send('Not found');
    return;
  }

  try {
    const result = await searchGene(<string>req.query.id);
    setHeaders(res);
    res.json({ items: result });
  } catch (err) {
    next(err);
  }
}

export async function nominatedGenesRoute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await getNominatedGenes();
    setHeaders(res);
    res.json({ items: result });
  } catch (err) {
    next(err);
  }
}
