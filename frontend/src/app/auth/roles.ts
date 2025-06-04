

export const Roles = {
  
  ACCOUNT_MANAGER: 'AccountManager',

  
  ADMIN: 'admin',

  
  OBCHODNIK: 'obchodnik',

  
  SKLADNIK: 'skladnik'
};


export const AccessControl = {
  
  [Roles.ADMIN]: ['firmy', 'dodavatelia', 'tovary', 'objednavky'],
  
  
  [Roles.OBCHODNIK]: ['firmy', 'objednavky'],
  
  
  [Roles.SKLADNIK]: ['dodavatelia', 'tovary']
}; 