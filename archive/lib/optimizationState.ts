// Optimization state management using sessionStorage
// This persists data across page navigation during the workflow

export interface OptimizationState {
  id: string;
  photo: {
    original: string;
    improved?: string;
    selected: 'original' | 'improved';
    analysis?: any;
  };
  keywords: {
    generated: any[];
    selected: string[];
  };
  title: {
    current: string;
    suggested: string;
    selected: 'current' | 'suggested';
  };
  description: {
    current: string;
    suggested: string;
    selected: 'current' | 'suggested';
  };
  score: {
    current: number;
    potential: number;
  };
  createdAt: number;
}

const STORAGE_KEY = 'elite_listing_optimization';

export const OptimizationStorage = {
  // Initialize new optimization
  create(id: string): OptimizationState {
    const state: OptimizationState = {
      id,
      photo: {
        original: '',
        selected: 'original'
      },
      keywords: {
        generated: [],
        selected: []
      },
      title: {
        current: '',
        suggested: '',
        selected: 'suggested'
      },
      description: {
        current: '',
        suggested: '',
        selected: 'suggested'
      },
      score: {
        current: 140,
        potential: 215
      },
      createdAt: Date.now()
    };
    
    this.save(state);
    return state;
  },

  // Get current optimization
  get(id: string): OptimizationState | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const data = sessionStorage.getItem(`${STORAGE_KEY}_${id}`);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Save optimization
  save(state: OptimizationState): void {
    if (typeof window === 'undefined') return;
    
    try {
      sessionStorage.setItem(`${STORAGE_KEY}_${state.id}`, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save optimization state:', error);
    }
  },

  // Update specific fields
  update(id: string, updates: Partial<OptimizationState>): void {
    const current = this.get(id);
    if (!current) return;
    
    const updated = { ...current, ...updates };
    this.save(updated);
  },

  // Clear optimization
  clear(id: string): void {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem(`${STORAGE_KEY}_${id}`);
  },

  // Get all optimizations
  getAll(): OptimizationState[] {
    if (typeof window === 'undefined') return [];
    
    try {
      const keys = Object.keys(sessionStorage).filter(k => k.startsWith(STORAGE_KEY));
      return keys.map(key => {
        const data = sessionStorage.getItem(key);
        return data ? JSON.parse(data) : null;
      }).filter(Boolean);
    } catch {
      return [];
    }
  }
};
