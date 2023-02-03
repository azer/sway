# This file is responsible for configuring your application
# and its dependencies with the aid of the Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
import Config

config :sway,
  ecto_repos: [Sway.Repo]

# Configures the endpoint
config :sway, SwayWeb.Endpoint,
  url: [host: "localhost"],
  render_errors: [view: SwayWeb.ErrorView, accepts: ~w(html json), layout: false],
  pubsub_server: Sway.PubSub,
  live_view: [signing_salt: "VU0V/0jX"]

# Configures the mailer
#
# By default it uses the "Local" adapter which stores the emails
# locally. You can see the emails in your browser, at "/dev/mailbox".
#
# For production it's recommended to configure a different adapter
# at the `config/runtime.exs`.
config :sway, Sway.Mailer, adapter: Swoosh.Adapters.Local

# Swoosh API client is needed for adapters other than SMTP.
config :swoosh, :api_client, false

# Configure esbuild (the version is required)
config :esbuild,
  version: "0.14.29",
  default: [
    args:
      ~w(js/app.tsx --bundle --target=es2017 --outdir=../priv/static/assets --external:/fonts/* --external:/images/*),
    cd: Path.expand("../assets", __DIR__),
    env: %{"NODE_PATH" => Path.expand("../deps", __DIR__)}
  ]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

config :ueberauth, Ueberauth,
  providers: [
    google: {Ueberauth.Strategy.Google, [default_scope: "email profile"]}
  ]

config :sway, Sway.Guardian,
  issuer: "sway",
  secret_key: "cPy1Th485lsMzkP28x7FffKiCWK5te7+oEBz/L4QOUIwGOU5/3N7Mrqnb+1Kvx7m"

config :sway, SwayWeb.ApiAuthPipeline,
  error_handler: SwayWeb.ApiAuthErrorHandler,
  module: Sway.Guardian

config :sway, Sway.Mailer,
  adapter: Swoosh.Adapters.Mailgun,
  api_key: "fea17b5c774c4b65cbb7de375c3a5182-75cd784d-c536d7e7",
  domain: "sway.so",
  base_url: "https://api.eu.mailgun.net/v3"

config :swoosh, :api_client, Swoosh.ApiClient.Hackney

config :sway, SwayWeb.ApiAuthPipeline,
  error_handler: SwayWeb.ApiAuthErrorHandler,
  module: Sway.Guardian

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{config_env()}.exs"
