{
  "manifest_version": 2,

  "name": "ChemSE",
  "description": "Saves time.",
  "version": "0.0.1",
  
  "author": "Gaurang Tandon",
  
  "browser_action": {
  },
  
  "background": {
	"scripts" : ["pre.js", "background.js"],
	"persistent" : false
  },  
  
  "content_scripts": [{
	"js" : ["pre.js", "detector.js"],
	"css": ["css/blockSiteModal.css"],
	"matches": ["<all_urls>"],
	"run_at": "document_start",
	"all_frames": true
  }],
  
  "permissions": [
	"storage"
  ],
  
  "options_page": "options.html",
  "options_ui": {
    "page": "options.html",
    "open_in_tab": true
  },
  "offline_enabled": true,
  "content_security_policy" : "default-src 'none'; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-eval'; frame-src 'self'"
}