import subprocess

def build():
    """
    Build the project.
    This function builds the Docker image for the Discord bot project.
    """

    print("Building the project...")
    subprocess.run(["docker", "build", "../", "--target", "bot", "--tag", "discord-bot:latest", "--no-cache"], check=True)

if __name__ == "__main__":
    build()
