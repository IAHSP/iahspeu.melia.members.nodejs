# iahspeu.melia.members.nodejs

---
We have moved our backend functionality from running as GCF's, to running as normal nodejs/express.
This gives us more control, as well as break's the reliance on GCF.

---

## run it
we need to tell it to rebuild the container when we run the docker compose:
```
docker-compose up --build
```
(note: i purposly left out the -d so i have an active running log)

note also, the `_secrets` dir, it contains stuff that doesn't get checked in
