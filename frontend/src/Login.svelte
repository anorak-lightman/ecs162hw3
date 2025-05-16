<script lang="ts">
  import { onMount } from 'svelte';

  let apiKey: string = '';
</script>

<main>
    <meta charset="UTF-8">
    <title>Login Page</title>
        <header>
            <div>
                <p>Log in or create an account</p>
            </div>

            <form>
                <lable for="emailAddress">Email Address</lable>
                <input type="text" id="emailAddress" name="emailAddress">
                <input type="submit" value="submit">
            </form>
            <p>or</p>
            <p>By continuing, you agree to the 
                <a href = "https://help.nytimes.com/hc/en-us/articles/115014893968-Terms-of-Sale">Terms of Sale</a>
                <a href = "https://help.nytimes.com/hc/en-us/articles/115014893428-Terms-of-Service">, Terms of Service</a>
                <a href = "https://help.nytimes.com/hc/en-us/articles/10940941449492-The-New-York-Times-Company-Privacy-Policy">, and Privacy Policy.</a>
            </p>
        </header>
        <section>
            
        </section>
        <footer>
            
        </footer>
</main>
