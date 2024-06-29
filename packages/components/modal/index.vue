<template>
  <div class="modal">vue modal{{ msg }}</div>
</template>

<script name="Modal" setup lang="ts">
  import { ref } from "vue";

  const msg = ref<string>("");

  setTimeout(() => {
    msg.value = "modal msg";
  }, 5000);

</script>
<style lang="scss" scope>
.modal {
  width: 100px; 
  height: 100px;
  background:red
}
</style>