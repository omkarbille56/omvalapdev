{
  "rules": {
    "cars": {
      ".read": true,
      ".write": true
    },
    "history": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "activity": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "admins": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "valets": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "meta": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "shiftTypes": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "shifts": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
