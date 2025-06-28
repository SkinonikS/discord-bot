from __future__ import annotations
import subprocess
import typer

app = typer.Typer(add_completion=False)

@app.command()
@app.command("i")
def install(
  release_name: str = "production",
  namespace: str = "discord-bot-cluster",
  charts_dir: str = "../helm-charts/discord-bot-cluster",
):
  """
  Install or upgrade the Discord bot cluster Helm release.
  """
  subprocess.run(['helm', 'upgrade', '--install', release_name, charts_dir, '--namespace', namespace, '--create-namespace'], check=True)

@app.command()
@app.command("u")
def uninstall(
  release_name: str = "production",
  namespace: str = "discord-bot-cluster"
):
  """
  Uninstall the Discord bot cluster Helm release.
  """
  subprocess.run(['helm', 'uninstall', release_name, '--namespace', namespace], check=True)

@app.command()
@app.command("b")
def build(
  cache: bool = False,
  image_name: str = "discord-bot:latest",
  target: str = "discord-bot",
  auto_install: bool = False
):
  """
  Build the Docker image for the Discord bot operator.
  """
  command = ["docker", "build", "../", "--target", target, "--tag", image_name]
  if cache is False:
    command.append("--no-cache")
  subprocess.run(command, check=True)

  if auto_install:
    install()

if __name__ == "__main__":
  app()
