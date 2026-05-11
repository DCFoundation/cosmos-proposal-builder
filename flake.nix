{
  description = "Agoric Cosmos Proposal Builder - Development Environment";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        
        # Node.js version - using LTS 20 which is compatible with React 18
        nodejs = pkgs.nodejs_20;
        
        # Yarn version specified in package.json
        yarn = pkgs.yarn.override { inherit nodejs; };
        
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Core development tools
            nodejs
            yarn
            
            # Git for version control
            git
            
            # Docker and Docker Compose (for the project's docker setup)
            docker
            docker-compose
            
            # Additional useful tools
            jq  # Used in package.json scripts
            curl
            
            # Development utilities
            nodePackages.typescript
            nodePackages.typescript-language-server
            nodePackages.vscode-langservers-extracted  # HTML/CSS/JSON language servers
            
            # Testing and linting tools (though these will be installed via yarn)
            nodePackages.eslint
            nodePackages.prettier
          ];

          shellHook = ''
        
            echo "📦 Node.js version: $(node --version)"
            echo "🧶 Yarn version: $(yarn --version)"
            echo ""
   
            # Set up environment variables
            export NODE_ENV=development
            
            # Ensure node_modules/.bin is in PATH for local package binaries
            export PATH="$PWD/node_modules/.bin:$PATH"
            
            # Create .envrc for direnv integration (optional but recommended)
            if [ ! -f .envrc ]; then
              echo "use flake" > .envrc
              echo "💡 Created .envrc file for direnv integration"
              echo "   Run 'direnv allow' to enable automatic environment loading"
            fi
          '';

          # Environment variables that might be useful
          env = {
            # Ensure npm/yarn uses the correct Node.js version
            npm_config_nodejs_version = nodejs.version;
            
            # Disable npm update notifications in development
            NO_UPDATE_NOTIFIER = "1";
            
            # Enable Yarn's offline mirror for better reproducibility
            YARN_ENABLE_OFFLINE_MODE = "false";
          };
        };

        # Optional: Add packages that can be built/installed
        packages = {
          # You could add custom packages here if needed
          inherit nodejs yarn;
        };

        # Optional: Define apps that can be run with `nix run`
        apps = {
          dev = {
            type = "app";
            program = "${pkgs.writeShellScript "dev" ''
              cd ${toString ./.}
              ${yarn}/bin/yarn install
              ${yarn}/bin/yarn dev
            ''}";
          };
          
          build = {
            type = "app";
            program = "${pkgs.writeShellScript "build" ''
              cd ${toString ./.}
              ${yarn}/bin/yarn install
              ${yarn}/bin/yarn build
            ''}";
          };
        };
      }
    );
}
