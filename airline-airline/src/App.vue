<script setup>
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
    <header>
        <nav>
            <RouterLink class="main-title" to="/">airline airline</RouterLink>
            <svg
                class="logo"
                width="220"
                height="72"
                viewBox="0 0 247 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    class="path"
                    d="M235.5 1.5H11.5C5.97715 1.5 1.5 5.97715 1.5 11.5V60.5C1.5 66.0229 5.97716 70.5 11.5 70.5H235.5C241.023 70.5 245.5 66.0228 245.5 60.5V11.5C245.5 5.97715 241.023 1.5 235.5 1.5Z"
                    stroke="grey"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        </nav>
    </header>
    <RouterView />
</template>

<style scoped>
.logo {
    position: absolute;
    left: 1.4rem;
    top: 1.3rem;
}

.path {
    stroke-dasharray: 700;
    stroke-dashoffset: 700;
    animation: dash 2s linear forwards;
}
/* stroke-dashoffset: 0; */
@keyframes dash {
    0% {
        stroke-dashoffset: 700;
        opacity: 0;
    }

    50% {
        stroke-dashoffset: 200;
        opacity: 1;
    }

    70% {
        stroke-dashoffset: 150;
    }

    90% {
        stroke-dashoffset: 100;
    }

    95% {
        stroke-dashoffset: 80;
    }

    98% {
        stroke-dashoffset: 50;
    }

    to {
        stroke-dashoffset: 0;
    }
}

.main-title {
    font-size: 2rem;
    font-weight: 500;
}

.title-span {
    color: rgb(224, 8, 16);
}

header {
    width: 100%;
    display: flex;
    margin: auto;
    line-height: 1.5;
    max-height: 100vh;
}

.logo {
    display: block;
    margin: 0 auto 2rem;
}

p {
    display: inline;
}

nav {
    padding: 1rem;
    white-space: nowrap;
    font-size: 1em;
    text-align: center;
}

nav a.router-link-exact-active {
    color: var(--color-text);
}

nav a.router-link-exact-active:hover {
    background-color: transparent;
}

nav a {
    display: inline-block;
    padding: 0 1rem;
    border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
    border: 0;
}
</style>
