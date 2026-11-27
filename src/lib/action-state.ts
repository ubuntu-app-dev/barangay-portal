/** What every form server action returns. Shared by the server actions and the client form. */
export type ActionState = {
  ok?: boolean;
  message?: string;
  /** Field name → message. */
  errors?: Record<string, string>;
  /** Bumps on every result so the form can react to repeated identical results. */
  at?: number;
};

export const initialState: ActionState = {};
