<script lang="ts">
  import { onMount } from 'svelte';

  let apiKey: string = '';

//   onMount(async () => {
//     try {
//       const res = await fetch('/api/key');
//       const data = await res.json();
//       apiKey = data.apiKey;
//     } catch (error) {
//       console.error('Failed to fetch API key:', error);
//     }
//   }); 
</script>

<main>
    <meta charset="UTF-8">
    <title>The New York Times</title>
        <header>
            <div>
                <ul class = "locations">
                    <li><a href = "https://www.nytimes.com/">U.S.</a></li>
                    <li><a href = "https://www.nytimes.com/international/">INTERNATIONAL</a></li>
                    <li><a href = "https://www.nytimes.com/ca/">CANADA</a></li>
                    <li><a href = "https://www.nytimes.com/es/">ESPAÑOL</a></li>
                    <li><a href = "https://cn.nytimes.com/">中文</a></li>
                </ul>
            </div>

            <div class = "header">
                <div class="header-left">
                    <p id="formattedDate"></p>
                    <p class="today">Today's Paper</p>
                </div>
                <div class="header-center"><a href="https://nytimes.com"><h1 class = "title">The New York Times</h1></a></div>
                <div class="header-right">
                    <button id="login_button">Login</button>
                </div>
            </div>

            <hr class="header-border">
        </header>

        <div class="comments-container" id ="comments-container-id">
            <div class="comments-header">
                <button class = "close-comments" id="close-comments">x</button>
            </div>
            <div class="comments-contents">
                <h1 class="comments-title" id="comments-title">Comments for:</h1>
                <form>
                    <label>
                    <input type="text" id="add-comment" name="add-comment" placeholder="Share your thoughts."><br>
                    </label>
                </form>
                <button class="submit-button" id="submit-button">SUBMIT</button>
                <button class="cancel-button" id="cancel-button">CANCEL</button>
            </div>
        </div>

        <section>
            <div class="grid-container">
                <div class="grid">
                    <div class="row1col left-col"></div>
                    <div class="row1col center-col"></div>
                    <div class="row1col right-col"></div>
                </div>
            </div>
        </section>

        <!-- <div class="comments-container" id ="comments-container-id">
            <div class="comments-header">
                <button class = "close-comments">x</button>
            </div>
            <div class="comments-contents">
                <h1 class="comments-title">Comments</h1>
                <form>
                    <label>
                    <input type="text" id="add-comment" name="add-comment" placeholder="Share your thoughts."><br>
                    </label>
                </form>
                <button class="submit-button">SUBMIT</button>
                <button class="cancel-button">CANCEL</button>
            </div>
        </div> -->

        <footer>
            <br>
            <hr class="footer">
            <!-- <a href="https://developer.nytimes.com"><img src="./images/poweredby_nytimes_200a.png" width = 200px></a> -->
        </footer>
</main>
