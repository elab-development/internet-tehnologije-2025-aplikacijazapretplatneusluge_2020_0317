<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('creators', function (Blueprint $table) {
            $table->foreign('korisnik_id')->references('id')->on('users')->onDelete('cascade');
        });

        Schema::table('sublevels', function (Blueprint $table) {
            $table->foreign('kreator_id')->references('id')->on('creators')->onDelete('cascade');
        });
        Schema::table('subscriptions', function (Blueprint $table) {
            $table->foreign('patron_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('kreator_id')->references('id')->on('creators')->onDelete('cascade');
            $table->foreign('nivo_id')->references('id')->on('sublevels')->onDelete('set null');
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->foreign('pretplata_id')->references('id')->on('subscriptions')->onDelete('cascade');
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->foreign('kreator_id')->references('id')->on('creators')->onDelete('cascade');
            $table->foreign('nivo_pristupa_id')->references('id')->on('sublevels')->onDelete('set null');
        });

        Schema::table('postimages', function (Blueprint $table) {
            $table->foreign('objava_id')->references('id')->on('posts')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('postimages', function (Blueprint $table) {
            $table->dropForeign(['objava_id']);
        });

        Schema::table('posts', function (Blueprint $table) {
            $table->dropForeign(['kreator_id']);
            $table->dropForeign(['nivo_pristupa_id']);
        });

        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['pretplata_id']);
        });

        Schema::table('subscriptions', function (Blueprint $table) {
            $table->dropForeign(['patron_id']);
            $table->dropForeign(['kreator_id']);
            $table->dropForeign(['nivo_id']);
        });

        Schema::table('sublevels', function (Blueprint $table) {
            $table->dropForeign(['kreator_id']);
        });
        
        Schema::table('creators', function (Blueprint $table) {
            $table->dropForeign(['korisnik_id']);
        });

    }
};
