defmodule Bafa.Repo do
  use Ecto.Repo,
    otp_app: :bafa,
    adapter: Ecto.Adapters.Postgres
end
