import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';

// Mapeamento de slugs para IDs de projetos Railway
const PROJECT_MAPPINGS: Record<string, string | undefined> = {
  'bs-cloaker': process.env.RAILWAY_CLOAKER_PROJECT_ID,
  'cybervault': process.env.RAILWAY_CYBERVAULT_PROJECT_ID,
  'sidertools': process.env.RAILWAY_SIDERTOOLS_PROJECT_ID,
  'hyper': process.env.RAILWAY_HYPER_PROJECT_ID,
  'hidra': process.env.RAILWAY_HIDRA_PROJECT_ID,
  'radar': process.env.RAILWAY_RADAR_PROJECT_ID,
};

// Railway GraphQL queries
const RAILWAY_GRAPHQL_URL = 'https://backboard.railway.app/graphql/v2';

const getProjectMetricsQuery = `
  query GetProjectMetrics($projectId: String!) {
    project(id: $projectId) {
      id
      name
      createdAt
      deployments(first: 1) {
        edges {
          node {
            id
            status
            createdAt
            staticUrl
            metrics {
              cpuUsagePct
              memoryUsageMB
              memoryLimitMB
              networkRxMB
              networkTxMB
              diskUsageMB
              diskLimitMB
            }
          }
        }
      }
      services {
        edges {
          node {
            id
            name
            icon
            createdAt
            updatedAt
          }
        }
      }
      environments {
        edges {
          node {
            id
            name
            deployments(first: 1) {
              edges {
                node {
                  status
                  createdAt
                }
              }
            }
          }
        }
      }
    }
  }
`;

const getAllProjectsMetricsQuery = `
  query GetAllProjects {
    me {
      projects {
        edges {
          node {
            id
            name
            createdAt
            deployments(first: 1) {
              edges {
                node {
                  status
                  createdAt
                  metrics {
                    cpuUsagePct
                    memoryUsageMB
                    memoryLimitMB
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticação admin
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verificar se tem API key do Railway configurada
    const RAILWAY_API_KEY = process.env.RAILWAY_API_KEY;
    if (!RAILWAY_API_KEY) {
      // Retornar dados simulados se não houver API key
      return NextResponse.json({
        warning: 'Railway API key not configured',
        data: generateMockMetrics(request.nextUrl.searchParams.get('app'))
      });
    }

    const appSlug = request.nextUrl.searchParams.get('app');
    
    if (appSlug) {
      // Buscar métricas de uma aplicação específica
      const projectId = PROJECT_MAPPINGS[appSlug];
      
      if (!projectId) {
        return NextResponse.json({
          error: 'Project not found',
          data: generateMockMetrics(appSlug)
        }, { status: 404 });
      }

      const response = await fetch(RAILWAY_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RAILWAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: getProjectMetricsQuery,
          variables: { projectId }
        })
      });

      if (!response.ok) {
        throw new Error(`Railway API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Processar e formatar os dados
      const metrics = processRailwayMetrics(data.data?.project);
      
      return NextResponse.json({ data: metrics });
      
    } else {
      // Buscar métricas de todos os projetos
      const response = await fetch(RAILWAY_GRAPHQL_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RAILWAY_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: getAllProjectsMetricsQuery
        })
      });

      if (!response.ok) {
        throw new Error(`Railway API error: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Processar todos os projetos
      const allMetrics = data.data?.me?.projects?.edges?.map((edge: any) => 
        processRailwayMetrics(edge.node)
      ) || [];
      
      return NextResponse.json({ data: allMetrics });
    }
    
  } catch (error) {
    console.error('Railway metrics error:', error);
    
    // Retornar dados simulados em caso de erro
    return NextResponse.json({
      error: 'Failed to fetch Railway metrics',
      data: generateMockMetrics(request.nextUrl.searchParams.get('app'))
    }, { status: 500 });
  }
}

// Processar métricas do Railway para formato padronizado
function processRailwayMetrics(project: any) {
  if (!project) return null;
  
  const latestDeployment = project.deployments?.edges?.[0]?.node;
  const metrics = latestDeployment?.metrics || {};
  
  return {
    projectId: project.id,
    projectName: project.name,
    status: latestDeployment?.status || 'UNKNOWN',
    deployment: {
      id: latestDeployment?.id,
      createdAt: latestDeployment?.createdAt,
      url: latestDeployment?.staticUrl,
    },
    metrics: {
      cpu: {
        usage: metrics.cpuUsagePct || 0,
        unit: '%'
      },
      memory: {
        usage: metrics.memoryUsageMB || 0,
        limit: metrics.memoryLimitMB || 512,
        usagePercent: metrics.memoryLimitMB 
          ? ((metrics.memoryUsageMB || 0) / metrics.memoryLimitMB) * 100 
          : 0,
        unit: 'MB'
      },
      disk: {
        usage: metrics.diskUsageMB || 0,
        limit: metrics.diskLimitMB || 1024,
        usagePercent: metrics.diskLimitMB
          ? ((metrics.diskUsageMB || 0) / metrics.diskLimitMB) * 100
          : 0,
        unit: 'MB'
      },
      network: {
        rx: metrics.networkRxMB || 0,
        tx: metrics.networkTxMB || 0,
        unit: 'MB'
      }
    },
    services: project.services?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      icon: edge.node.icon,
    })) || [],
    environments: project.environments?.edges?.map((edge: any) => ({
      id: edge.node.id,
      name: edge.node.name,
      status: edge.node.deployments?.edges?.[0]?.node?.status || 'UNKNOWN'
    })) || []
  };
}

// Gerar métricas simuladas para desenvolvimento
function generateMockMetrics(appSlug: string | null) {
  const baseMetrics = {
    projectId: `mock-${appSlug || 'all'}`,
    projectName: appSlug || 'All Projects',
    status: ['SUCCESS', 'BUILDING', 'FAILED'][Math.floor(Math.random() * 3)],
    deployment: {
      id: `deployment-${Date.now()}`,
      createdAt: new Date().toISOString(),
      url: `https://${appSlug || 'app'}.railway.app`,
    },
    metrics: {
      cpu: {
        usage: Math.floor(Math.random() * 100),
        unit: '%'
      },
      memory: {
        usage: Math.floor(Math.random() * 400),
        limit: 512,
        usagePercent: Math.floor(Math.random() * 100),
        unit: 'MB'
      },
      disk: {
        usage: Math.floor(Math.random() * 800),
        limit: 1024,
        usagePercent: Math.floor(Math.random() * 100),
        unit: 'MB'
      },
      network: {
        rx: Math.floor(Math.random() * 100),
        tx: Math.floor(Math.random() * 100),
        unit: 'MB'
      }
    },
    services: [
      { id: '1', name: 'web', icon: '🌐' },
      { id: '2', name: 'worker', icon: '⚙️' }
    ],
    environments: [
      { id: '1', name: 'production', status: 'SUCCESS' },
      { id: '2', name: 'staging', status: 'SUCCESS' }
    ]
  };
  
  if (appSlug) {
    return baseMetrics;
  }
  
  // Retornar array para todas as apps
  return Object.keys(PROJECT_MAPPINGS).map(slug => ({
    ...baseMetrics,
    projectId: `mock-${slug}`,
    projectName: slug,
  }));
}