defmodule Sway.Repo do
  use Ecto.Repo,
    otp_app: :sway,
    adapter: Ecto.Adapters.Postgres
end
